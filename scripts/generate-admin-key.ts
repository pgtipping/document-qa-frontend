import crypto from "crypto";
import fs from "fs";
import path from "path";

// Generate a secure random key
function generateAdminKey(): string {
  // Generate 32 bytes of random data and convert to base64
  return crypto.randomBytes(32).toString("base64");
}

// Update .env file with the new admin key
function updateEnvFile(adminKey: string) {
  const envPath = path.join(process.cwd(), ".env");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  // Read existing .env file or create new one based on .env.example
  let envContent = "";
  try {
    envContent = fs.readFileSync(envPath, "utf8");
  } catch (error) {
    // If .env doesn't exist, use .env.example as template
    envContent = fs.readFileSync(envExamplePath, "utf8");
  }

  // Replace or add ADMIN_KEY
  const adminKeyRegex = /^ADMIN_KEY=.*$/m;
  const newAdminKeyLine = `ADMIN_KEY=${adminKey}`;

  if (adminKeyRegex.test(envContent)) {
    // Replace existing ADMIN_KEY
    envContent = envContent.replace(adminKeyRegex, newAdminKeyLine);
  } else {
    // Add new ADMIN_KEY
    envContent += `\n\n# Admin Access\n${newAdminKeyLine}`;
  }

  // Write updated content back to .env
  fs.writeFileSync(envPath, envContent);
}

// Main execution
try {
  const adminKey = generateAdminKey();
  updateEnvFile(adminKey);
  console.log("\x1b[32m%s\x1b[0m", "✓ Admin key generated successfully!");
  console.log("\nYour new admin key is:");
  console.log("\x1b[33m%s\x1b[0m", adminKey);
  console.log("\nThis key has been added to your .env file.");
  console.log("Keep this key secure and do not share it.");
} catch (error) {
  console.error("\x1b[31m%s\x1b[0m", "✗ Error generating admin key:");
  console.error(error);
  process.exit(1);
}
