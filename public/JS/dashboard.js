let connectBtn = document.getElementById("connectWallet");
let mintBtn = document.getElementById("mintCoins");
let userAccount = null; 

if (document.querySelector("#walletAddress i") &&
    document.querySelector("#walletAddress i").innerText !== "Not connected") {
  userAccount = document.querySelector("#walletAddress i").innerText;
  if (mintBtn) mintBtn.style.display = "inline-block";
  if (connectBtn) connectBtn.style.display = "none";
}


if (connectBtn) {
  connectBtn.addEventListener("click", async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        userAccount = accounts[0];
        document.getElementById("walletAddress").innerText = "Wallet: " + userAccount;

        await fetch("/save-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: userAccount }),
          credentials: "include"
        });

        if (mintBtn) mintBtn.style.display = "inline-block";
        if (connectBtn) connectBtn.style.display = "none";
      } catch (err) {
        console.error("MetaMask connect error:", err);
      }
    } else {
      alert("MetaMask not detected! Install it: https://metamask.io/");
    }
  });
}

if (mintBtn) {
  mintBtn.addEventListener("click", async () => {
    if (!userAccount) return alert("Connect wallet first");

    try {
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAccount,
            to: userAccount,
            value: "0x0",
          },
        ],
      });

      console.log("Transaction hash:", tx);

      const res = await fetch("/mint-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        const coinDisplay = document.querySelector(".display-6");
        if (coinDisplay) {
          coinDisplay.innerHTML = `Coins: ${data.newBalance}`;
        }
        alert(`Minted PupCoins! New balance: ${data.newBalance}`);
      }
    } catch (err) {
      console.error("Mint error:", err);
    }
  });
}
