import React, { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = "wss://streaming.bitquery.io/graphql?token=ory_at_TChRLPCsp3OGXkfYdKZAIz6RnAd1Uy4McEcxdWpLGEw.8mpu9Rys0ux7En4xUa-CzP0RNRl7UMTlDt-j-T24D_4";

    const options = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 5000,
      maxRetries: Infinity,
      debug: true, // Enable debug for more detailed logs
    };

    const ws = new ReconnectingWebSocket(url, ["graphql-ws"], options);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected to Bitquery.");

      const initMessage = JSON.stringify({ type: "connection_init" });
      console.log("Sending init message:", initMessage);
      ws.send(initMessage);

      const message = JSON.stringify({
        type: "start",
        id: "1",
        payload: {
          query: `
subscription {
  EVM(mempool: true) {
    Transactions {
      Transaction {
        CostInUSD
        Cost
        Data
        From
        Hash
        To
        Type
        ValueInUSD
        Value
        Time
        Index
        Gas
      }
      TransactionStatus {
        FaultError
        EndError
        Success
      }
    }
  }
}
          `,
        },
      });

      console.log("Sending subscription message:", message);
      setTimeout(() => {
        ws.send(message);
      }, 1000);
    };

    ws.onmessage = (event) => {
      console.log("Received raw data:", event.data);
      const response = JSON.parse(event.data);
      console.log("Parsed response:", response);

      if (response.type === "data") {
        setData(response.payload.data);
        console.log("Received data from Bitquery:", response.payload.data);
      } else {
        console.log("Received non-data message:", response);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      console.log("Disconnected from Bitquery. Event:", event);
    };

    ws.onerror = (event) => {
      console.error("WebSocket Error:", event);
      setError("WebSocket error occurred. See console for details.");
    };

    return () => {
      console.log("Closing WebSocket connection.");
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>Bitquery WebSocket</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;
