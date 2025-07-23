import { CLIClient } from "./cli-client";

async function quickTest() {
  try {
    console.log("🧪 Quick CLI Test");
    const client = new CLIClient();
    await client.init();
    await client.runCommand("show-status", []);
  } catch (error) {
    console.error("Error:", error);
  }
}

quickTest();
