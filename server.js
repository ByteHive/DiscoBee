const express = require('express');
const Net = require('net');
const xml2js = require('xml2js');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 80;

let persistentClient = null;
let isConnecting = false;

const parseXml = (xml) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const ensureConnection = () => {
  return new Promise((resolve, reject) => {
    if (persistentClient && !persistentClient.destroyed) {
      resolve(persistentClient);
    } else if (!isConnecting) {
      isConnecting = true;
      persistentClient = new Net.Socket();
      
      persistentClient.connect({ port: 5959, host: '127.0.0.1' }, () => {
        console.log('Connection established with the NDI discovery server.');
        persistentClient.setKeepAlive(true, 1000);
        isConnecting = false;
        resolve(persistentClient);
      });

      persistentClient.on('error', (error) => {
        console.log('Error:', error);
        isConnecting = false;
        persistentClient = null;
        reject(error);
      });

      persistentClient.on('close', () => {
        console.log('Connection closed');
        persistentClient = null;
      });
    } else {
      // Wait for the ongoing connection attempt to finish
      const checkConnection = setInterval(() => {
        if (!isConnecting) {
          clearInterval(checkConnection);
          if (persistentClient && !persistentClient.destroyed) {
            resolve(persistentClient);
          } else {
            reject(new Error('Failed to establish connection'));
          }
        }
      }, 100);
    }
  });
};

const getSources = async () => {
  try {
    const client = await ensureConnection();
    return new Promise((resolve, reject) => {
      let chunks = "";
      
      const dataHandler = async (chunk) => {
        chunks += chunk.toString();
        
        if (chunks.includes("<sources>") && chunks.includes("</sources>")) {
          client.removeListener('data', dataHandler);
          
          try {
            const xmlData = chunks.substring(chunks.indexOf("<sources>"), chunks.indexOf("</sources>") + 10);
            if (xmlData === "<sources></sources>") {
              resolve([]);
              return;
            }
            const result = await parseXml(xmlData);
            const sources = result.sources.source;
            const formattedSources = sources.map((item) => ({
              name: item.name[0],
              address: item.address[0],
              port: item.port[0],
              groups: item.groups[0].group
            }));
            resolve(formattedSources);
          } catch (error) {
            reject(error);
          }
        }
      };

      client.on('data', dataHandler);

      let message = Buffer.alloc(9);
      message.fill("<query/>", 0, 8);
      client.write(message);
    });
  } catch (error) {
    console.error('Error in getSources:', error);
    throw error;
  }
};

app.get('/api/sources', async (req, res) => {
  try {
    const sources = await getSources();
    res.json(sources);
  } catch (error) {
    console.error('Failed to fetch NDI sources:', error);
    res.status(500).json({ error: 'Failed to fetch NDI sources' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const broadcastSources = async () => {
  try {
    const sources = await getSources();
    const message = JSON.stringify({ type: 'sources', data: sources });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    console.error('Error broadcasting sources:', error);
  }
};

setInterval(broadcastSources, 2000);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});