// Go to www.alchemy.com and create an account to grab your own api key!
const apiKey = "demo";
const endpoint = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;

const getAddressNFTs = async (owner, contractAddress, retryAttempt) => {
    if (retryAttempt === 5) {
        return;
    }
    if (owner) {
        let data;
        try {
            if (contractAddress) {
                data = await fetch(`${endpoint}/getNFTs?owner=${owner}&contractAddresses%5B%5D=${contractAddress}`).then(data => data.json())
            } else {
                data = await fetch(`${endpoint}/getNFTs?owner=${owner}`).then(data => data.json())
            }
        } catch (e) {
            getAddressNFTs(owner, contractAddress, retryAttempt+1)
        }

        // NFT token IDs basically
        return data
    }
}

const getNFTsMetadata = async (NFTS) => {
    return Promise.allSettled(NFTS.map(async (NFT) => {
        const metadata = await fetch(`${endpoint}/getNFTMetadata?contractAddress=${NFT.contract.address}&tokenId=${NFT.id.tokenId}`,).then(data => data.json())
        let imageUrl;
        console.log("metadata", metadata)
        if (metadata.media[0].gateway) {
            imageUrl = metadata.media[0].gateway
        } else {
            imageUrl = "https://via.placeholder.com/500"
        }

        return {
            id: NFT.id.tokenId,
            contractAddress: NFT.contract.address,
            image: imageUrl,
            title: metadata.metadata.name,
            description: metadata.metadata.description,
            attributes: metadata.metadata.attributes
        }
    }))
}

const fetchNFTs = async (owner, contractAddress, setNFTs) => {
    const data = await getAddressNFTs(owner, contractAddress)
    if (data.ownedNfts.length) {
        const NFTs = await getNFTsMetadata(data.ownedNfts)
        let fullfilledNFTs = NFTs.filter(NFT => NFT.status == "fulfilled")
        setNFTs(fullfilledNFTs)
    } else {
        setNFTs(null)
    }
}

export {fetchNFTs};