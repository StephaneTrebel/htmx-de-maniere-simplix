mermaid.initialize({
  theme: 'base',
  startOnLoad: false,
  themeVariables: {
    background: 'transparent',
    primaryColor: '#253d2d',
    primaryTextColor: '#fbf0df',
    primaryBorderColor: '#78e08f',
    lineColor: '#78e08f',
    secondaryColor: '#253d2d',
    tertiaryColor: '#253d2d',
    edgeLabelBackground: 'transparent',
    clusterBkg: '#1e3327',
    clusterBorder: '#78e08f',
  }
});

window.slidesk.mermaidChange = () => {
  mermaid.run({
    querySelector: '.sd-current .language-mermaid'
  });
};
