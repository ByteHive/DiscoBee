const express = require('express');
const Net = require('net');
const xml2js = require('xml2js');

const app = express();
const port = 80;

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

const getSources = (retries = 3) => {
  return new Promise((resolve, reject) => {
    const client = new Net.Socket();
    let chunks = "";

    const tryConnect = (attemptsLeft) => {
      client.connect({ port: 5959, host: '127.0.0.1' }, () => {
        console.log('Connection established with the NDI discovery server.');
        
        // Enable keep-alive on the socket
        client.setKeepAlive(true, 1000); // Enable keep-alive with 1 second delay

        let message = Buffer.alloc(9);
        message.fill("<query/>", 0, 8);
        client.write(message);
      });

      client.on('data', async (chunk) => {
        chunks += chunk.toString();
        if (chunks.includes("<sources>") && chunks.includes("</sources>")) {
          try {
            const xmlData = chunks.substring(chunks.indexOf("<sources>"), chunks.indexOf("</sources>") + 10);
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
            console.log("Error parsing XML:", error);
            reject(error);
          }
          
        }
      });

      client.on('error', (error) => {
        console.log('Error:', error);
        if (attemptsLeft > 0) {
          console.log(`Retrying... ${attemptsLeft} attempts left.`);
          setTimeout(() => tryConnect(attemptsLeft - 1), 2000);
        } else {
          reject(error);
        }
      });

      client.on('close', () => {
        console.log('Connection closed');
      });

      // Set a timeout for the connection attempt
      client.setTimeout(5000, () => {
        console.log('Connection attempt timed out');
        client.destroy();
        if (attemptsLeft > 0) {
          console.log(`Retrying... ${attemptsLeft} attempts left.`);
          setTimeout(() => tryConnect(attemptsLeft - 1), 2000);
        } else {
          reject(new Error('Connection timed out after all retries'));
        }
      });
    };

    tryConnect(retries);
  });
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

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});