(async () => {
  const mod = await import('pdf-parse');
  console.log(Object.keys(mod));
  console.log("type of mod:", typeof mod);
  console.log("type of mod.default:", typeof mod.default);
  
  let m = mod;
  while (m && typeof m !== "function" && m.default) {
    m = m.default;
  }
  console.log("type of m:", typeof m);
})();
