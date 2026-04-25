import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Helper to load and "mock" the route file
async function loadHandler() {
  const filePath = path.resolve("app/api/user/route.jsx");
  let content = fs.readFileSync(filePath, "utf-8");

  // Remove imports to make it a valid JS for this test environment
  content = content.replace(/import.*from.*;/g, "");

  // Add mock definitions at the top
  const mocks = `
    const defaultDb = {};
    const defaultUsersTable = {};
    const defaultEq = () => {};
    const defaultNextResponse = {};
    const defaultCurrentUser = () => {};
  `;

  const finalContent = mocks + content;
  const tempFilePath = path.resolve("tests/temp_route.mjs");
  fs.writeFileSync(tempFilePath, finalContent);

  const module = await import("file://" + tempFilePath);
  return {
    GET: module.GET,
    cleanup: () => fs.unlinkSync(tempFilePath)
  };
}

// Mocking NextResponse
const MockNextResponse = {
  json: (data, init) => ({
    status: init?.status || 200,
    json: async () => data,
  }),
};

// Mocking eq
const MockEq = (a, b) => ({ operator: "eq", left: a, right: b });

test("GET /api/user - Error Handling - should return 500 when currentUser throws", async () => {
  const { GET, cleanup } = await loadHandler();
  try {
    const currentUserMock = async () => {
      throw new Error("Clerk error");
    };

    const response = await GET(null, {
      currentUser: currentUserMock,
      NextResponse: MockNextResponse,
      db: {},
      usersTable: { email: "email" },
      eq: MockEq
    });
    const body = await response.json();

    assert.strictEqual(response.status, 500);
    assert.strictEqual(body.error, "Internal Server Error");
  } finally {
    cleanup();
  }
});

test("GET /api/user - Happy Path - should return 200 with user data", async () => {
  const { GET, cleanup } = await loadHandler();
  try {
    const currentUserMock = async () => ({
      id: "user_123",
      primaryEmailAddress: { emailAddress: "test@example.com" },
      firstName: "John",
      lastName: "Doe",
      publicMetadata: { subscriptionId: "sub_456" }
    });

    const dbMock = {
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([{ name: "John Doe DB", email: "test@example.com" }])
        })
      })
    };

    const response = await GET(null, {
      currentUser: currentUserMock,
      db: dbMock,
      NextResponse: MockNextResponse,
      usersTable: { email: "email" },
      eq: MockEq
    });
    const body = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(body.name, "John Doe DB");
    assert.strictEqual(body.plan, "Premium");
    assert.strictEqual(body.subscriptionId, "sub_456");
  } finally {
    cleanup();
  }
});

test("GET /api/user - Unauthorized - should return 401 when no user", async () => {
  const { GET, cleanup } = await loadHandler();
  try {
    const currentUserMock = async () => null;

    const response = await GET(null, {
      currentUser: currentUserMock,
      NextResponse: MockNextResponse
    });
    const body = await response.json();

    assert.strictEqual(response.status, 401);
    assert.strictEqual(body.error, "Unauthorized");
  } finally {
    cleanup();
  }
});
