// MV3 Cookie PoC - 测试 3 种方案

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TEST_ALL') {
    runAllTests().then(sendResponse)
    return true // async
  }
  if (msg.type === 'FETCH_USAGE') {
    fetchClaudeUsage().then(sendResponse)
    return true
  }
  if (msg.type === 'TEST_CHATGPT') {
    testChatGPT().then(sendResponse)
    return true
  }
})

async function runAllTests() {
  const results = {}

  // 先读 cookie
  const cookie = await chrome.cookies.get({
    url: 'https://claude.ai',
    name: 'sessionKey'
  })

  if (!cookie?.value) {
    return { error: '未找到 sessionKey cookie，请先登录 claude.ai' }
  }

  results.cookieFound = `sessionKey 前20字符: ${cookie.value.substring(0, 20)}...`

  // ===== 方案 A: credentials: 'include' =====
  try {
    const t0 = Date.now()
    const res = await fetch('https://claude.ai/api/organizations', {
      credentials: 'include'
    })
    const data = await res.json()
    results.methodA = {
      name: "credentials: 'include'",
      status: res.status,
      success: res.ok,
      data: Array.isArray(data) ? data.map(o => ({ uuid: o.uuid, name: o.name })) : data,
      ms: Date.now() - t0
    }
  } catch (e) {
    results.methodA = { name: "credentials: 'include'", error: e.message }
  }

  // ===== 方案 B: 手动设置 Cookie header =====
  try {
    const t0 = Date.now()
    const res = await fetch('https://claude.ai/api/organizations', {
      headers: { 'Cookie': `sessionKey=${cookie.value}` },
      credentials: 'omit'
    })
    const data = await res.json()
    results.methodB = {
      name: '手动 Cookie header',
      status: res.status,
      success: res.ok,
      data: Array.isArray(data) ? data.map(o => ({ uuid: o.uuid, name: o.name })) : data,
      ms: Date.now() - t0
    }
  } catch (e) {
    results.methodB = { name: '手动 Cookie header', error: e.message }
  }

  // ===== 方案 C: credentials: 'omit' (无 cookie 对照组) =====
  try {
    const t0 = Date.now()
    const res = await fetch('https://claude.ai/api/organizations', {
      credentials: 'omit'
    })
    results.methodC = {
      name: '无 cookie 对照组',
      status: res.status,
      success: res.ok,
      ms: Date.now() - t0
    }
  } catch (e) {
    results.methodC = { name: '无 cookie 对照组', error: e.message }
  }

  return results
}

// ===== Task 3.1: 调用 Claude usage API 并保存真实响应 =====
async function fetchClaudeUsage() {
  const results = {}

  try {
    // Step 1: 获取 organizations
    const orgsRes = await fetch('https://claude.ai/api/organizations', {
      credentials: 'include'
    })
    if (!orgsRes.ok) return { error: `organizations API returned ${orgsRes.status}` }
    const orgs = await orgsRes.json()
    results.organizations = orgs

    // Step 2: 对每个 org 获取 usage
    for (const org of orgs) {
      const usageRes = await fetch(
        `https://claude.ai/api/organizations/${org.uuid}/usage`,
        { credentials: 'include' }
      )
      results[`usage_${org.name || org.uuid}`] = {
        status: usageRes.status,
        data: usageRes.ok ? await usageRes.json() : await usageRes.text()
      }

      // Step 3: 尝试获取 overage_spend_limit
      try {
        const overageRes = await fetch(
          `https://claude.ai/api/organizations/${org.uuid}/overage_spend_limit`,
          { credentials: 'include' }
        )
        results[`overage_${org.name || org.uuid}`] = {
          status: overageRes.status,
          data: overageRes.ok ? await overageRes.json() : null
        }
      } catch (e) {
        results[`overage_${org.name || org.uuid}`] = { error: e.message }
      }
    }
  } catch (e) {
    results.error = e.message
  }

  return results
}

// ===== Task 3.2: 测试 ChatGPT credentials: 'include' =====
async function testChatGPT() {
  const results = {}

  try {
    const res = await fetch(
      'https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27',
      { credentials: 'include' }
    )
    results.accountsCheck = {
      status: res.status,
      ok: res.ok,
      data: res.ok ? await res.json() : await res.text()
    }
  } catch (e) {
    results.accountsCheck = { error: e.message }
  }

  // 降级尝试 /backend-api/me
  try {
    const res = await fetch('https://chatgpt.com/backend-api/me', {
      credentials: 'include'
    })
    results.me = {
      status: res.status,
      ok: res.ok,
      data: res.ok ? await res.json() : null
    }
  } catch (e) {
    results.me = { error: e.message }
  }

  return results
}
