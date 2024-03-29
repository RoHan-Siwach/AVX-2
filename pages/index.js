import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionAmount, setTransactionAmount] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      setError("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);

      // Once the wallet is set, we can get a reference to our deployed contract
      getATMContract();
    } catch (error) {
      setError("Error connecting account");
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        // Validate the transaction amount
        if (transactionAmount <= 0) {
          setError("Please enter a valid amount for deposit");
          return;
        }

        let tx = await atm.deposit(transactionAmount);
        await tx.wait();
        getBalance();
        updateTransactions(`Deposited ${transactionAmount} ETH`);
      } catch (error) {
        setError("Error depositing funds");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        // Validate the transaction amount
        if (transactionAmount <= 0) {
          setError("Please enter a valid amount for withdrawal");
          return;
        }

        let tx = await atm.withdraw(transactionAmount);
        await tx.wait();
        getBalance();
        updateTransactions(`Withdrawn ${transactionAmount} ETH`);
      } catch (error) {
        setError("Error withdrawing funds");
      }
    }
  };

  const updateTransactions = (transaction) => {
    setTransactions((prevTransactions) => [transaction, ...prevTransactions]);
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>Connect your Metamask wallet</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <input
            type="number"
            value={transactionAmount}
            onChange={(e) => setTransactionAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <h2>Recent Transactions</h2>
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>{transaction}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
