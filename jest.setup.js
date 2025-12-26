import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder (required by Stellar SDK)
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_SECRET_SUPABASE_KEY = "test-service-key";

// Stellar test wallet
process.env.TEST_STELLAR_WALLET =
  "GAI74SI2CTURCDG6PGIXSG5B4KQ4E5GHEQMBS6Q4AJNYCHXRQZIJMRC7";
