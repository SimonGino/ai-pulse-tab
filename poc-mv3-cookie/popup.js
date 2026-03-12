document.getElementById('run').addEventListener('click', async () => {
  const out = document.getElementById('output')
  out.innerHTML = '<p>测试中...</p>'

  const results = await chrome.runtime.sendMessage({ type: 'TEST_ALL' })

  if (results.error) {
    out.innerHTML = `<p class="fail">${results.error}</p>`
    return
  }

  let html = `<p>${results.cookieFound}</p>`

  for (const key of ['methodA', 'methodB', 'methodC']) {
    const r = results[key]
    if (!r) continue
    const ok = r.success
    html += `
      <h3>${r.name}: <span class="${ok ? 'pass' : 'fail'}">${ok ? 'PASS ✓' : `FAIL (${r.status || r.error})`}</span></h3>
      <pre>${JSON.stringify(r, null, 2)}</pre>
    `
  }

  html += `
    <h3>结论</h3>
    <pre>${getSummary(results)}</pre>
  `
  out.innerHTML = html
})

function getSummary(r) {
  const lines = []
  if (r.methodA?.success) lines.push('✓ 方案A credentials:include 可用 → 推荐使用，最简单')
  else lines.push('✗ 方案A credentials:include 不可用')

  if (r.methodB?.success) lines.push('✓ 方案B 手动Cookie header 可用')
  else lines.push('✗ 方案B 手动Cookie header 不可用 (符合预期，Cookie是forbidden header)')

  if (r.methodC?.success) lines.push('⚠ 方案C 无cookie也返回200？检查是否真的需要认证')
  else lines.push('✓ 方案C 无cookie返回' + (r.methodC?.status || 'error') + ' (对照组正常)')

  return lines.join('\n')
}

// Task 3.1: 获取 Claude Usage 真实响应
document.getElementById('fetchUsage').addEventListener('click', async () => {
  const out = document.getElementById('output')
  out.innerHTML = '<p>获取 Claude Usage 数据中...</p>'

  const results = await chrome.runtime.sendMessage({ type: 'FETCH_USAGE' })
  out.innerHTML = `
    <h3>Claude API 真实响应</h3>
    <p>请将以下 JSON 保存到 <code>docs/claude-api-response-samples/</code></p>
    <pre>${JSON.stringify(results, null, 2)}</pre>
  `
  lastResult = results
})

// Task 3.2: 测试 ChatGPT
document.getElementById('testChatgpt').addEventListener('click', async () => {
  const out = document.getElementById('output')
  out.innerHTML = '<p>测试 ChatGPT credentials:include...</p>'

  const results = await chrome.runtime.sendMessage({ type: 'TEST_CHATGPT' })
  out.innerHTML = `
    <h3>ChatGPT PoC 结果</h3>
    <pre>${JSON.stringify(results, null, 2)}</pre>
  `
  lastResult = results
})

// 复制结果到剪贴板
let lastResult = null
document.getElementById('copyResult').addEventListener('click', async () => {
  if (!lastResult) {
    alert('请先运行一个测试')
    return
  }
  await navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2))
  alert('已复制到剪贴板')
})
