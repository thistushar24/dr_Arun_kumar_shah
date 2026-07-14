/**
 * Helper to commit files directly to GitHub via GitHub REST API.
 * This enables permanent file uploads and content changes on serverless deployments.
 */

import { getCloudEnv } from "@/lib/env";

export async function saveToGitHub(
  relativePath: string, // e.g. "content/books/my-book.mdx" or "public/uploads/photo.jpg"
  content: string | Buffer,
  commitMessage: string,
): Promise<{ success: boolean; error?: string }> {
  const token = await getCloudEnv("GITHUB_TOKEN");
  if (!token) {
    return {
      success: false,
      error: "GITHUB_TOKEN environment variable not set",
    };
  }

  const owner = (await getCloudEnv("GITHUB_OWNER")) || "drarunshah24-dot";
  const repo = (await getCloudEnv("GITHUB_REPO")) || "website";
  const branch = (await getCloudEnv("GITHUB_BRANCH")) || "main";

  // Clean relative path leading slash
  const cleanPath = relativePath.replace(/^\/+/, "");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

  try {
    // 1. Check if file exists on GitHub to obtain its current SHA (required for overwrites)
    const getSha = async () => {
      const getRes = await fetch(`${url}?ref=${branch}&_ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "National-Urology-Center-Admin",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      if (getRes.ok) {
        const getJson = await getRes.json().catch(() => ({}));
        return getJson.sha as string | undefined;
      }
      return undefined;
    };

    const sha = await getSha();

    // 2. Convert content to base64
    const base64Content =
      typeof content === "string"
        ? Buffer.from(content, "utf8").toString("base64")
        : content.toString("base64");

    // 3. PUT file to GitHub
    let putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "National-Urology-Center-Admin",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    // 4. If SHA mismatch occurs (409 Conflict or 422), refresh SHA directly with no-store and retry once
    if (putRes.status === 409 || putRes.status === 422) {
      const latestSha = await getSha();
      putRes = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "National-Urology-Center-Admin",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch,
          ...(latestSha ? { sha: latestSha } : {}),
        }),
      });
    }

    if (!putRes.ok) {
      const errText = await putRes.text().catch(() => "Unknown error");
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.message) errMsg = errJson.message;
      } catch {
        // use plain text if not JSON
      }
      console.error("GitHub API error:", errMsg);
      return {
        success: false,
        error: errMsg || "GitHub API PUT failed",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Error saving to GitHub API:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error committing to GitHub",
    };
  }
}

export async function deleteFromGitHub(
  relativePath: string,
  commitMessage: string,
): Promise<{ success: boolean; error?: string }> {
  const token = await getCloudEnv("GITHUB_TOKEN");
  if (!token) {
    return {
      success: false,
      error: "GITHUB_TOKEN environment variable not set",
    };
  }

  const owner = (await getCloudEnv("GITHUB_OWNER")) || "drarunshah24-dot";
  const repo = (await getCloudEnv("GITHUB_REPO")) || "website";
  const branch = (await getCloudEnv("GITHUB_BRANCH")) || "main";

  const cleanPath = relativePath.replace(/^\/+/, "");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

  try {
    const getSha = async () => {
      const getRes = await fetch(`${url}?ref=${branch}&_ts=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "National-Urology-Center-Admin",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      if (getRes.ok) {
        const getJson = await getRes.json().catch(() => ({}));
        return getJson.sha as string | undefined;
      }
      return undefined;
    };

    const sha = await getSha();
    if (!sha) {
      return { success: false, error: "File not found on GitHub repository" };
    }

    let delRes = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "National-Urology-Center-Admin",
      },
      body: JSON.stringify({
        message: commitMessage,
        sha,
        branch,
      }),
    });

    if (delRes.status === 409 || delRes.status === 422) {
      const latestSha = await getSha();
      if (latestSha) {
        delRes = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "National-Urology-Center-Admin",
          },
          body: JSON.stringify({
            message: commitMessage,
            sha: latestSha,
            branch,
          }),
        });
      }
    }

    if (!delRes.ok) {
      const errText = await delRes.text().catch(() => "Unknown error");
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.message) errMsg = errJson.message;
      } catch {
        // use plain text if not JSON
      }
      return {
        success: false,
        error: errMsg || "GitHub API DELETE failed",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Error deleting from GitHub API:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error deleting from GitHub",
    };
  }
}
