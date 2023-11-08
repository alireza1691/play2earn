import { ethers} from '@/node_modules/ethers/lib.commonjs/index'



export default function Home() {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/67c6eca1cf9c49af826e5476cda53e0c`
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

    </main>
  )
}
