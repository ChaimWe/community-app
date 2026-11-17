import { connectDatabase } from "../config/database";
import { seedAdmin } from "../services/authService";

connectDatabase()
  .then(seedAdmin)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
