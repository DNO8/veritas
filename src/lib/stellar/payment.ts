import * as StellarSdk from "@stellar/stellar-sdk";
import { STELLAR_CONFIG, type StellarNetwork } from "./config";

export interface CreatePaymentParams {
  sourcePublicKey: string;
  destinationPublicKey: string;
  amount: string;
  asset?: "XLM" | "USDC";
  memo?: string;
  network?: StellarNetwork;
}

export interface PaymentResult {
  xdr: string;
  networkPassphrase: string;
}

/**
 * Crea una transacción de pago en Stellar
 * Retorna el XDR para ser firmado por Freighter
 */
export async function createPaymentTransaction(
  params: CreatePaymentParams,
): Promise<PaymentResult> {
  const {
    sourcePublicKey,
    destinationPublicKey,
    amount,
    asset = "XLM",
    memo,
    network = "TESTNET",
  } = params;

  // Validar inputs
  if (!sourcePublicKey || !destinationPublicKey) {
    throw new Error("Source and destination addresses are required");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("Amount must be positive");
  }

  const config = STELLAR_CONFIG[network];
  const server = new StellarSdk.Horizon.Server(config.horizonUrl);
  const networkPassphrase =
    network === "TESTNET"
      ? StellarSdk.Networks.TESTNET
      : StellarSdk.Networks.PUBLIC;

  try {
    // Cargar cuenta fuente
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Crear asset
    let stellarAsset: StellarSdk.Asset;
    if (asset === "XLM") {
      stellarAsset = StellarSdk.Asset.native();
    } else {
      // USDC en Stellar (usar el issuer correcto según la red)
      const usdcIssuer =
        network === "TESTNET"
          ? "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" // USDC testnet issuer
          : "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"; // USDC mainnet issuer
      stellarAsset = new StellarSdk.Asset("USDC", usdcIssuer);
    }

    // Construir transacción
    const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: stellarAsset,
          amount: amount,
        }),
      )
      .setTimeout(180); // 3 minutos

    // Agregar memo si existe
    if (memo) {
      txBuilder.addMemo(StellarSdk.Memo.text(memo));
    }

    const transaction = txBuilder.build();

    return {
      xdr: transaction.toXDR(),
      networkPassphrase,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create payment transaction: ${error.message}`);
    }
    throw new Error("Failed to create payment transaction");
  }
}

/**
 * Envía una transacción firmada a la red Stellar
 */
export async function submitTransaction(
  signedXdr: string,
  network: StellarNetwork = "TESTNET",
): Promise<{ hash: string; success: boolean }> {
  const config = STELLAR_CONFIG[network];
  const server = new StellarSdk.Horizon.Server(config.horizonUrl);

  try {
    const transaction = new StellarSdk.Transaction(
      signedXdr,
      network === "TESTNET"
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC,
    );

    const result = await server.submitTransaction(transaction);

    return {
      hash: result.hash,
      success: result.successful,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to submit transaction: ${error.message}`);
    }
    throw new Error("Failed to submit transaction");
  }
}

/**
 * Flujo completo: crear, firmar y enviar pago
 * (Requiere que Freighter esté conectado)
 */
export async function sendPayment(
  params: CreatePaymentParams,
  signTransactionFn: (
    xdr: string,
    networkPassphrase: string,
  ) => Promise<string>,
): Promise<{ hash: string; success: boolean }> {
  // 1. Crear transacción
  const { xdr, networkPassphrase } = await createPaymentTransaction(params);

  // 2. Firmar con Freighter
  const signedXdr = await signTransactionFn(xdr, networkPassphrase);

  // 3. Enviar a la red
  const result = await submitTransaction(signedXdr, params.network);

  return result;
}
