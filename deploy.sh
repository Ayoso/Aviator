vercel --prod && vercel alias set `vercel ls | grep Production | head -n 1 | awk {print }` aviator-icony.vercel.app
