import * as sass from "sass";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { watch } from "fs";
import http from "http";
import { createReadStream } from "fs";
import { glob } from "glob";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import net from "net";

const MODE = process.env.MODE || "dev";
const IS_DEV = MODE === "dev";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = IS_DEV ? "dev" : "dist";

const CONFIG = {
  INCLUDES: {
    meta: "./src/includes/meta.html",
    header: "./src/includes/header.html",
    footer: "./src/includes/footer.html",
    scripts: "./src/includes/scripts.html",
    livereload: "./src/includes/livereload.html",
  },
  SCSS: {
    SRC: "./src/resources/scss/style.scss",
    DEST: `./${DIST_DIR}/resources/css`,
    WATCH: "./src/resources/scss",
  },
  SCRIPT: {
    SRC: "./src/resources/js/**/*.js",
    DEST: `./${DIST_DIR}/resources/js`,
    WATCH: "./src/resources/js",
  },
  HTML: {
    SRC: ["./src/pages/**/*.html"],
    ROOT: "./src/index.html",
    DEST: `./${DIST_DIR}/pages`,
    WATCH: "./src/pages",
  },
  INCLUDES_WATCH: "./src/includes",
  UI_GUIDE: {
    SRC: "./src/_ui_guide",
    DEST: `./${DIST_DIR}/_ui_guide`,
    WATCH: "./src/_ui_guide",
    SCSS_SRC: "./src/_ui_guide/resources/scss/**/*.scss",
    SCSS_DEST: `./${DIST_DIR}/_ui_guide/resources/css`,
  },
  SERVER: {
    PORT: 3000,
    HOST: "localhost",
  },
};

let browserClients = [];
let isBuilding = false;
let buildTimer = null;

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    try {
      fs.rmSync(DIST_DIR, { recursive: true, force: true });
    } catch (error) {
      if (error.code === "EBUSY") {
        console.warn(`⚠️  폴더 정리 대기 중...`);
        setTimeout(() => {
          try {
            fs.rmSync(DIST_DIR, { recursive: true, force: true });
          } catch (err) {
            console.warn(
              `⚠️  폴더를 완전히 삭제할 수 없습니다. 계속 진행합니다.`
            );
          }
        }, 500);
      }
    }
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function initializeDirectories() {
  const dirs = [
    "src/resources/scss",
    "src/resources/js",
    "src/resources/images",
    "src/resources/fonts",
    "src/pages",
    "src/_ui_guide",
    `${DIST_DIR}/resources/css`,
    `${DIST_DIR}/resources/js`,
    `${DIST_DIR}/resources/images`,
    `${DIST_DIR}/resources/fonts`,
    `${DIST_DIR}/_ui_guide`,
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function readInclude(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function removeDevBlock(content) {
  if (!content) return content;
  content = content.replace(
    /<!--\s*\[s\][\s\S]*?<!--\s*\/\/\s*\[e\][\s\S]*?-->/g,
    ""
  );
  content = content.replace(/<!--\s*\[s\][\s\S]*?\[e\]\s*-->/g, "");
  return content;
}

function processHTML(htmlContent, includes) {
  let processed = htmlContent;
  Object.entries(includes).forEach(([key, content]) => {
    const pattern = new RegExp(`<!--\\s*{include:${key}}\\s*-->`, "g");
    if (key === "dev") {
      if (IS_DEV) {
        processed = processed.replace(pattern, content);
      } else {
        const cleaned = removeDevBlock(content);
        processed = processed.replace(pattern, cleaned);
      }
      return;
    }
    processed = processed.replace(pattern, content);
  });
  return processed;
}

async function compileSCSS() {
  if (!fs.existsSync(CONFIG.SCSS.SRC)) {
    console.warn(`⚠️  SCSS 파일 없음: ${CONFIG.SCSS.SRC}`);
    return;
  }
  try {
    const result = sass.compile(CONFIG.SCSS.SRC, { style: "expanded" });
    if (!fs.existsSync(CONFIG.SCSS.DEST)) {
      fs.mkdirSync(CONFIG.SCSS.DEST, { recursive: true });
    }

    const processor = postcss([
      autoprefixer({
        overrideBrowserslist: [
          "> 0.5%",
          "last 5 versions",
          "Firefox ESR",
          "IE 11",
          "not dead",
        ],
      }),
    ]);
    const prefixed = await processor.process(result.css, {
      from: undefined,
    });

    fs.writeFileSync(path.join(CONFIG.SCSS.DEST, "style.css"), prefixed.css);
  } catch (error) {
    console.error(`✗ SCSS 오류: ${error.message}`);
  }
}

function copyJS() {
  const files = glob.sync(CONFIG.SCRIPT.SRC);
  if (!files.length) return;
  fs.mkdirSync(CONFIG.SCRIPT.DEST, { recursive: true });
  files.forEach((file) => {
    const fileName = path.basename(file);
    const outputFile = path.join(CONFIG.SCRIPT.DEST, fileName);
    fs.copyFileSync(file, outputFile);
  });
}

function processHTMLPages(target) {
  const includes = {
    meta: readInclude(CONFIG.INCLUDES.meta),
    header: readInclude(CONFIG.INCLUDES.header),
    footer: readInclude(CONFIG.INCLUDES.footer),
    scripts: readInclude(CONFIG.INCLUDES.scripts),
    livereload: readInclude(CONFIG.INCLUDES.livereload),
  };

  if (!target || target === "pages") {
    const pages = glob.sync(CONFIG.HTML.SRC);
    pages.forEach((file) => {
      let html = fs.readFileSync(file, "utf8");
      html = processHTML(html, includes);

      const relative = path.relative("./src/pages", file);
      const output = path.join(CONFIG.HTML.DEST, relative);

      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, html);
    });
  }
  if ((!target || target === "index") && fs.existsSync(CONFIG.HTML.ROOT)) {
    let html = fs.readFileSync(CONFIG.HTML.ROOT, "utf8");
    html = processHTML(html, includes);
    fs.writeFileSync(`./${DIST_DIR}/index.html`, html);
  }
}

function copyUIGuide() {
  const src = CONFIG.UI_GUIDE.SRC;
  const dest = CONFIG.UI_GUIDE.DEST;
  if (!fs.existsSync(src)) return;

  if (fs.existsSync(dest)) {
    try {
      fs.rmSync(dest, { recursive: true, force: true });
    } catch (error) {
      if (error.code === "EBUSY") {
        console.warn(`⚠️  ${dest} 폴더가 사용 중입니다. 잠시 후 재시도...`);
        setTimeout(() => {
          try {
            fs.rmSync(dest, { recursive: true, force: true });
          } catch (err) {
            console.warn(
              `⚠️  폴더를 삭제할 수 없습니다. 기존 파일을 덮어씁니다.`
            );
          }
        }, 300);
        return;
      }
    }
  }

  const copyDir = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    for (const file of fs.readdirSync(s)) {
      const sp = path.join(s, file);
      const dp = path.join(d, file);
      const stat = fs.statSync(sp);
      if (stat.isDirectory()) {
        if (path.basename(sp) !== "scss") {
          copyDir(sp, dp);
        }
      } else if (!file.endsWith(".scss")) {
        try {
          fs.copyFileSync(sp, dp);
        } catch (error) {
          if (error.code === "EBUSY") {
            console.warn(`⚠️  ${file} 파일이 사용 중입니다.`);
          }
        }
      }
    }
  };

  copyDir(src, dest);
}

function processUIGuideHTML() {
  const files = glob.sync(`${CONFIG.UI_GUIDE.DEST}/**/*.html`);
  files.forEach((file) => {
    let html = fs.readFileSync(file, "utf8");
    const includes = {
      meta: readInclude(CONFIG.INCLUDES.meta),
      header: readInclude(CONFIG.INCLUDES.header),
      footer: readInclude(CONFIG.INCLUDES.footer),
      scripts: readInclude(CONFIG.INCLUDES.scripts),
      livereload: readInclude(CONFIG.INCLUDES.livereload),
    };
    html = processHTML(html, includes);
    if (!IS_DEV) {
      html = html.replace(
        /<!--\s*\[s\][\s\S]*?<!--\s*\/\/\s*\[e\][\s\S]*?-->/g,
        ""
      );
      html = html.replace(/<!--\s*\[s\][\s\S]*?\[e\]\s*-->/g, "");
      html = html.replace(/<!--\s*개발시[\s\S]*?개발시[\s\S]*?-->/g, "");
    }
    fs.writeFileSync(file, html);
  });
}

async function compileUIGuideSCSS() {
  const files = glob.sync(CONFIG.UI_GUIDE.SCSS_SRC);
  if (!files.length) return;

  const destDir = path.resolve(CONFIG.UI_GUIDE.SCSS_DEST);
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of files) {
    try {
      const result = sass.compile(file, { style: "expanded" });
      const fileName = path.basename(file, ".scss") + ".css";
      const outputFile = path.resolve(destDir, fileName);

      const processor = postcss([
        autoprefixer({
          overrideBrowserslist: [
            "> 0.2%",
            "last 10 versions",
            "IE 10",
            "IE 11",
          ],
        }),
      ]);
      const prefixed = await processor.process(result.css, {
        from: undefined,
      });

      fs.writeFileSync(outputFile, prefixed.css);
    } catch (error) {
      console.error(`✗ UI Guide SCSS 오류 (${file}): ${error.message}`);
    }
  }
}

async function buildAll(options = {}) {
  if (buildTimer) clearTimeout(buildTimer);

  const doBuild = async () => {
    if (isBuilding) return;
    isBuilding = true;

    console.log(`[${new Date().toLocaleTimeString()}] 🔄 Rebuild...`);
    await compileSCSS();
    copyUIGuide();
    await compileUIGuideSCSS();
    copyJS();
    processHTMLPages(options.only);
    processUIGuideHTML();

    reloadBrowser();
    isBuilding = false;
  };

  buildTimer = setTimeout(doBuild, 50);
}

function reloadBrowser() {
  browserClients.forEach((res) => {
    res.write("data: reload\n\n");
  });
}

function watchFiles() {
  console.log("👁️  파일 감시 시작\n");

  const watchConfigs = [
    { path: CONFIG.SCSS.WATCH, name: "SCSS", cb: () => buildAll() },
    { path: CONFIG.SCRIPT.WATCH, name: "JS", cb: () => buildAll() },
    {
      path: CONFIG.HTML.WATCH,
      name: "HTML",
      cb: () => buildAll({ only: "pages" }),
    },
    { path: CONFIG.INCLUDES_WATCH, name: "Include", cb: () => buildAll() },
    { path: CONFIG.UI_GUIDE.WATCH, name: "_ui_guide", cb: () => buildAll() },
  ];

  const debounce = (fn, ms = 60) => {
    let t = null;
    return (...args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  watchConfigs.forEach(({ path: dir, name, cb }) => {
    if (!fs.existsSync(dir)) return;
    watch(
      dir,
      { recursive: true },
      debounce(() => {
        console.log(`📝 변경 감지 → ${name}`);
        cb();
      }, 60)
    );
  });

  if (fs.existsSync(CONFIG.HTML.ROOT)) {
    let indexMTime = fs.statSync(CONFIG.HTML.ROOT).mtimeMs;
    fs.watchFile(CONFIG.HTML.ROOT, { interval: 50 }, (curr, prev) => {
      if (curr.mtimeMs !== indexMTime) {
        indexMTime = curr.mtimeMs;
        console.log(`📝 변경 감지 → HTML`);
        buildAll({ only: "index" });
      }
    });
  }
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(
    `사용 가능한 포트를 찾을 수 없습니다 (${startPort} ~ ${
      startPort + maxAttempts - 1
    })`
  );
}

function startServer(port) {
  const baseDir = path.join(__dirname, DIST_DIR);

  const server = http.createServer((req, res) => {
    if (req.url === "/__reload") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      browserClients.push(res);
      res.on("close", () => {
        browserClients = browserClients.filter((c) => c !== res);
      });
      return;
    }

    let filePath = path.join(baseDir, req.url === "/" ? "index.html" : req.url);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1>");
        return;
      }

      const ext = path.extname(filePath);
      const mime =
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".svg": "image/svg+xml",
        }[ext] || "application/octet-stream";

      res.writeHead(200, { "Content-Type": mime });
      createReadStream(filePath).pipe(res);
    });
  });

  server.once("error", async (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠️  포트 ${port}이(가) 사용 중입니다.`);
      const nextPort = port + 1;
      if (nextPort - CONFIG.SERVER.PORT < 10) {
        console.log(`→ 포트 ${nextPort}로 재시도합니다...\n`);
        startServer(nextPort);
      } else {
        console.error(
          `❌ 사용 가능한 포트를 찾을 수 없습니다 (${CONFIG.SERVER.PORT} ~ ${port})`
        );
        process.exit(1);
      }
    } else {
      console.error(`❌ 서버 오류: ${err.message}`);
      process.exit(1);
    }
  });

  server.listen(port, CONFIG.SERVER.HOST, () => {
    if (port !== CONFIG.SERVER.PORT) {
      console.log(`✓ 포트 ${port}에서 서버 실행 중\n`);
    }
    console.log(`▶ http://${CONFIG.SERVER.HOST}:${port}`);
  });
}

async function dev() {
  const modeText = IS_DEV ? "개발 모드 (dev)" : "빌드 완료 (prod)";
  console.log(`🛠️  ${modeText}`);

  cleanDist();
  initializeDirectories();

  await compileSCSS();
  copyUIGuide();
  await compileUIGuideSCSS();
  copyJS();
  processHTMLPages();
  processUIGuideHTML();

  if (IS_DEV) {
    startServer(CONFIG.SERVER.PORT);
    watchFiles();
  } else {
    console.log(`✓ ${DIST_DIR} 폴더를 확인하세요`);
  }
}

dev();
