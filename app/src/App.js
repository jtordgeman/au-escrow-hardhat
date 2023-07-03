import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";
import EscrowContract from "./artifacts/contracts/Escrow.sol/Escrow";

const provider = new ethers.BrowserProvider(window.ethereum);

export async function approve(escrowContract, signer) {
    if (!signer) {
        signer = await provider.getSigner();
    }

    const approveTxn = await escrowContract.connect(signer).approve();
    await approveTxn.wait();
}

function App() {
    const [escrows, setEscrows] = useState([]);
    const [account, setAccount] = useState();
    const [signer, setSigner] = useState();

    useEffect(() => {
        async function getAccounts() {
            const accounts = await provider.send("eth_requestAccounts", []);

            setAccount(accounts[0]);
            const providerSigner = await provider.getSigner();
            setSigner(providerSigner);
            await getTransactions(providerSigner.address);
        }

        getAccounts();
    }, []);

    async function getTransactions(address) {
        const localData = localStorage.getItem(`${address}-contracts`) || "[]";
        const localDataParsed = JSON.parse(localData);

        for (const contract of localDataParsed) {
            const escrow = new ethers.Contract(contract.address, EscrowContract.abi, provider);
            contract.handleApprove = async () => {
                escrow.on("Approved", () => {
                    document.getElementById(contract.address).className = "complete";
                    document.getElementById(contract.address).innerText = "✓ It's been approved!";
                });

                await approve(escrow, signer);
            };
        }

        setEscrows(localDataParsed);
    }

    async function newContract() {
        const beneficiary = document.getElementById("beneficiary").value;
        const arbiter = document.getElementById("arbiter").value;
        const value = ethers.parseEther(document.getElementById("depositAmount").value);
        const escrowContract = await deploy(signer, arbiter, beneficiary, value);

        const address = await escrowContract.getAddress();

        const localEscrow = {
            address,
            arbiter,
            beneficiary,
            value: value.toString(),
        };

        const localData = localStorage.getItem(`${signer.address}-contracts`) || "[]";

        const localDataParsed = JSON.parse(localData);

        localDataParsed.push(localEscrow);

        localStorage.setItem(`${signer.address}-contracts`, JSON.stringify(localDataParsed));

        console.log("escrowContract", escrowContract);
        const escrow = {
            address,
            arbiter,
            beneficiary,
            value: value.toString(),
            handleApprove: async () => {
                escrowContract.on("Approved", () => {
                    document.getElementById(escrowContract.address).className = "complete";
                    document.getElementById(escrowContract.address).innerText = "✓ It's been approved!";
                });

                await approve(escrowContract, signer);
            },
        };

        setEscrows([...escrows, escrow]);
    }

    return (
        <>
            <div className="contract">
                <h1> New Contract </h1>
                <label>
                    Arbiter Address
                    <input type="text" id="arbiter" />
                </label>

                <label>
                    Beneficiary Address
                    <input type="text" id="beneficiary" />
                </label>

                <label>
                    Deposit Amount (in ETH)
                    <input type="text" id="depositAmount" />
                </label>

                <div
                    className="button"
                    id="deploy"
                    onClick={(e) => {
                        e.preventDefault();

                        newContract();
                    }}
                >
                    Deploy
                </div>
            </div>

            <div className="existing-contracts">
                <h1> Existing Contracts </h1>

                <div id="container">
                    {escrows.map((escrow) => {
                        return <Escrow key={escrow.address} {...escrow} />;
                    })}
                </div>
            </div>
        </>
    );
}

export default App;
