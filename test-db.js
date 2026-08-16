import 'dotenv/config';
import { getPayments } from './dist/server.cjs';
// Wait, the compiled file is dist/server.cjs, we can't easily import from it if it doesn't export getPayments.
