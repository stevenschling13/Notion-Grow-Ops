# Ngrok Deployment Notes

The provided environment does not include Homebrew, so running `brew install ngrok` is not possible here. To deploy the application with ngrok, run the following commands on a macOS or Linux system where Homebrew and network access are available:

```bash
brew install ngrok
ngrok config add-authtoken 34tWHIkvT4C1MJOj5FI1AE0fHY6_xpRR5hG5QiT7msHuFzBj
ngrok http 80
```

Once the tunnel is running, visit `https://unprefaced-libby-sporadic.ngrok-free.dev` to access the app.

## Testing status

- Automated checks: `pnpm test` (Vitest) ✅
- Ngrok tunnel validation: Blocked inside this sandbox. Attempts to download the Linux binary via `curl -sSL https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip` returned `403 CONNECT tunnel failed`, so the tunnel must be verified on a machine with unrestricted outbound network access.

After you verify the tunnel on your own machine, please leave a GitHub comment mentioning `@copilot` so the follow-up automation can review the deployment.
