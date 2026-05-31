mermaid.initialize({
  theme: 'base',
  startOnLoad: false,
  themeVariables: {
    // background: 'transparent',
    primaryColor: '#2B2',
    // primaryTextColor: '#fbf0df',
    // primaryBorderColor: '#78e08f',
    // lineColor: '#78e08f',
    secondaryColor: '#efe',
    tertiaryColor: '#dfd',
    // edgeLabelBackground: 'transparent',
    clusterBkg: '#aea',
    clusterBorder: '#78e08f',
  }
});

window.slidesk.mermaidChange = () => {
  mermaid.run({
    querySelector: '.sd-current .language-mermaid'
  });
};
