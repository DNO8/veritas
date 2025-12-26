/**
 * Script de prueba para validar la wallet de Stellar
 * Wallet de prueba: GAI74SI2CTURCDG6PGIXSG5B4KQ4E5GHEQMBS6Q4AJNYCHXRQZIJMRC7
 */

import * as StellarSdk from "@stellar/stellar-sdk";

const TEST_WALLET = "GAI74SI2CTURCDG6PGIXSG5B4KQ4E5GHEQMBS6Q4AJNYCHXRQZIJMRC7";
const TESTNET_HORIZON = "https://horizon-testnet.stellar.org";

async function testWallet() {
  console.log("🌟 Testing Stellar Wallet Integration\n");
  console.log(`Wallet: ${TEST_WALLET}\n`);

  const server = new StellarSdk.Horizon.Server(TESTNET_HORIZON);

  try {
    // 1. Validar formato de wallet
    console.log("1️⃣ Validating wallet format...");
    const isValid = StellarSdk.StrKey.isValidEd25519PublicKey(TEST_WALLET);
    console.log(`   ✅ Valid Stellar address: ${isValid}\n`);

    if (!isValid) {
      throw new Error("Invalid wallet address format");
    }

    // 2. Verificar si la cuenta existe en testnet
    console.log("2️⃣ Checking if account exists on testnet...");
    try {
      const account = await server.loadAccount(TEST_WALLET);
      console.log(`   ✅ Account exists on testnet`);
      console.log(`   Sequence: ${account.sequence}`);

      // 3. Obtener balances
      console.log("\n3️⃣ Account balances:");
      account.balances.forEach((balance: any) => {
        if (balance.asset_type === "native") {
          console.log(`   💰 XLM: ${balance.balance}`);
        } else {
          console.log(`   💰 ${balance.asset_code}: ${balance.balance}`);
        }
      });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log(`   ⚠️  Account does not exist on testnet yet`);
        console.log(
          `   💡 Fund it at: https://friendbot.stellar.org/?addr=${TEST_WALLET}`,
        );
      } else {
        throw error;
      }
    }

    // 4. Crear una transacción de prueba (sin enviarla)
    console.log("\n4️⃣ Testing transaction creation...");
    try {
      const sourceAccount = await server.loadAccount(TEST_WALLET);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination:
              "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
            asset: StellarSdk.Asset.native(),
            amount: "10",
          }),
        )
        .addMemo(StellarSdk.Memo.text("Test donation"))
        .setTimeout(180)
        .build();

      console.log(`   ✅ Transaction created successfully`);
      console.log(`   XDR length: ${transaction.toXDR().length} characters`);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log(`   ⚠️  Cannot create transaction - account not funded`);
      } else {
        throw error;
      }
    }

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during testing:", error);
    process.exit(1);
  }
}

testWallet();
