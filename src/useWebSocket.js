import { useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

const useWebSocket = (url, options, query, maxRetries = 5) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new ReconnectingWebSocket(url, ["graphql-ws"], options);

      ws.onopen = () => {
        setIsConnected(true);
        setRetryCount(0);
        ws.send(JSON.stringify({ type: "connection_init" }));
        
        setTimeout(() => {
          ws.send(
            JSON.stringify({
              type: "start",
              id: "1",
              payload: { query },
            })
          );
        }, 1000);
      };

      ws.onmessage = (event) => {
        console.log("response ",event.data)
        const response = JSON.parse(event.data);
        if (response.type === "data") {
          setData(response.payload.data);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          setTimeout(connectWebSocket, 2000);
        } else {
          setError("Max retry attempts reached. Could not connect to Bitquery.");
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket Error:", event);
        setError("WebSocket error occurred. See console for details.");
      };

      return () => {
        ws.close();
      };
    };

    connectWebSocket();
  }, [retryCount]);

  return { data, error, isConnected };
};

export default useWebSocket;
