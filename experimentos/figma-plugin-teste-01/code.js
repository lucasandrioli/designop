const frame = figma.createFrame();

frame.name = "_teste-plugin-designops";
frame.resize(360, 100);
frame.x = figma.viewport.center.x - 180;
frame.y = figma.viewport.center.y - 50;
frame.fills = [
  {
    type: "SOLID",
    color: { r: 0.92, g: 0.96, b: 1 }
  }
];

figma.viewport.scrollAndZoomIntoView([frame]);
figma.notify("Plugin DesignOps executado com sucesso.");
figma.closePlugin();
