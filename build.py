import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"
js = (src / "app1.js").read_text() + "\n" + (src / "app2.js").read_text()
assert "</script>" not in js
(root / "app.bundle.js").write_text(js)
html = (src / "page.html").read_text().replace("/*APP*/", js)
(root / "index.html").write_text(html)
print("index.html", len(html), "octets")
