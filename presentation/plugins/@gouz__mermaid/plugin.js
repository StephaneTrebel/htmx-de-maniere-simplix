mermaid.initialize({
  theme: 'base',
  startOnLoad: false,
  themeVariables: {
    // background: 'transparent',
    primaryColor: '#d5ebd9',
    // primaryTextColor: '#fbf0df',
    primaryBorderColor: '#b4e7bf',
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
