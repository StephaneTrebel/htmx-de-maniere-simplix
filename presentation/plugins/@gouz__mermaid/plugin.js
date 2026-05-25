mermaid.initialize({
  theme: 'base',
  startOnLoad: false
});

window.slidesk.mermaidChange = () => {
  mermaid.run({
    querySelector: '.sd-current .language-mermaid'
  });
};