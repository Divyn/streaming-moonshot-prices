import React from "react";
import useWebSocket from "./useWebSocket";

const App = () => {
  const query = `
    subscription MyQuery {
      Solana {
        DEXTrades(
          where: {
            Trade: { Dex: { ProtocolFamily: { is: "Moonshot" } } }
            Transaction: { Result: { Success: true } }
          }
        ) {
          Instruction {
            Program {
              Method
            }
          }
          Trade {
            Dex {
              ProtocolFamily
              ProtocolName
            }
            Buy {
              Amount
              Account {
                Address
              }
              Currency {
                Name
                Symbol
                MintAddress
                Decimals
                Fungible
                Uri
              }
            }
            Sell {
              Amount
              Account {
                Address
              }
              Currency {
                Name
                Symbol
                MintAddress
                Decimals
                Fungible
                Uri
              }
            }
          }
          Transaction {
            Signature
          }
        }
      }
    }
  `;

  const url = "wss://streaming.bitquery.io/eap?token=ory_at_TChRPCsNRl7ULMTlDt-j-T24D_4";
  const options = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 5000,
    maxRetries: Infinity,
    debug: true,
  };

  const { data, error, isConnected } = useWebSocket(url, options, query);

  return (
    <div>
      <h1>Bitquery WebSocket</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p>Error: {error}</p>}
      {data ? (
        <table>
          <tbody>
            <tr>
              <th>Protocol Family</th>
              <td>{data.Solana.DEXTrades[0].Trade.Dex.ProtocolFamily}</td>
            </tr>
            <tr>
              <th>Protocol Name</th>
              <td>{data.Solana.DEXTrades[0].Trade.Dex.ProtocolName}</td>
            </tr>
            <tr>
              <th>Buy Amount</th>
              <td>{data.Solana.DEXTrades[0].Trade.Buy.Amount}</td>
            </tr>
            <tr>
              <th>Buy Currency</th>
              <td>{data.Solana.DEXTrades[0].Trade.Buy.Currency.Symbol}</td>
            </tr>
            <tr>
              <th>Sell Amount</th>
              <td>{data.Solana.DEXTrades[0].Trade.Sell.Amount}</td>
            </tr>
            <tr>
              <th>Sell Currency</th>
              <td>{data.Solana.DEXTrades[0].Trade.Sell.Currency.Symbol}</td>
            </tr>
            <tr>
              <th>Transaction Signature</th>
              <td>{data.Solana.DEXTrades[0].Transaction.Signature}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default App;
