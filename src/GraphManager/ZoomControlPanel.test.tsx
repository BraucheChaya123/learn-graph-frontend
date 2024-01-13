import { Controller } from "./GraphEdit";
import { makeMockController } from "./GraphEdit.testingutil";
import {
  makeOnZoomAndPanListenerNoDebounce,
  makeZoomControl,
  MIN_ZOOM_PERCENTAGE_DIFFERENCE,
  ZOOM_LEVEL_MAX,
  ZOOM_LEVEL_MIN,
  ZOOM_LEVEL_STEP,
} from "./ZoomControlPanel";
jest.mock("./Zoom", () => ({
  zoomStep: jest.fn(),
  ZoomDirection: { In: "In", Out: "Out" },
}));

describe("makeZoomControl", () => {
  let ctrl: Controller;
  let zoomCtrl: ReturnType<typeof makeZoomControl>;

  beforeEach(() => {
    // @ts-ignore
    ctrl = makeMockController();
    // @ts-ignore
    ctrl.graph.current = { nodes: [{ id: "a" }, { id: "b" }], links: [] };
    zoomCtrl = makeZoomControl(ctrl);
  });

  it("should handle onZoomIn correctly", () => {
    ctrl.zoom.zoomStepStack.push(2);
    zoomCtrl.onZoomIn();
    expect(ctrl.zoom.setZoomStepStack).toHaveBeenCalledWith(
      ctrl.zoom.zoomStepStack,
    );
    const zoomState = {
      zoomSteps: ctrl.zoom.zoomState.zoomSteps,
      graphData: ctrl.graph.current,
    };
    expect(ctrl.zoom.setZoomState).toHaveBeenCalledWith(zoomState);
    expect(ctrl.zoom.setZoomLevel).toHaveBeenCalledWith(
      ctrl.zoom.zoomLevel + 1,
    );
    expect(ctrl.forceGraphRef.current?.d3ReheatSimulation).toHaveBeenCalled();
    expect(require("./Zoom").zoomStep).toHaveBeenCalledWith(
      { direction: "In", steps: 1 },
      zoomState,
    );
  });

  it("should handle onZoomOut correctly", () => {
    zoomCtrl.onZoomOut();
    expect(ctrl.zoom.setZoomStepStack).toHaveBeenCalledWith(
      ctrl.zoom.zoomStepStack,
    );
    const zoomState = {
      zoomSteps: ctrl.zoom.zoomState.zoomSteps,
      graphData: ctrl.graph.current,
    };
    expect(ctrl.zoom.setZoomState).toHaveBeenCalledWith(zoomState);
    expect(ctrl.zoom.setZoomLevel).toHaveBeenCalledWith(
      ctrl.zoom.zoomLevel - 1,
    );
    expect(ctrl.forceGraphRef.current?.d3ReheatSimulation).toHaveBeenCalled();
    expect(require("./Zoom").zoomStep).toHaveBeenCalledWith(
      { direction: "Out", steps: 1 },
      zoomState,
    );
  });

  it("should do nothing if zooming out while on min zoom level", () => {
    ctrl.zoom.zoomLevel = ZOOM_LEVEL_MIN;
    zoomCtrl.onZoomOut();
    expect(ctrl.zoom.setZoomStepStack).not.toHaveBeenCalled();
    expect(ctrl.zoom.setZoomLevel).not.toHaveBeenCalled();
    expect(ctrl.zoom.setZoomState).not.toHaveBeenCalled();
    expect(require("./Zoom").zoomStep).not.toHaveBeenCalled();
  });

  it("should do nothing if zooming in while on max zoom level", () => {
    ctrl.zoom.zoomLevel = ZOOM_LEVEL_MAX;
    zoomCtrl.onZoomIn();
    expect(ctrl.zoom.setZoomStepStack).not.toHaveBeenCalled();
    expect(ctrl.zoom.setZoomLevel).not.toHaveBeenCalled();
    expect(ctrl.zoom.setZoomState).not.toHaveBeenCalled();
    expect(require("./Zoom").zoomStep).not.toHaveBeenCalled();
  });

  describe("onZoomChange", () => {
    it("should zoom to the difference", () => {
      // @ts-ignore: don't care about 'Event'
      zoomCtrl.onZoomChange(ctrl.zoom.zoomLevel + 2);
      expect(ctrl.zoom.setZoomLevel).toHaveBeenCalledWith(
        ctrl.zoom.zoomLevel + 2,
      );
      expect(ctrl.zoom.setZoomStepStack).toHaveBeenCalledTimes(2);
    });
    it("should cap zoom at MAX", () => {
      // @ts-ignore
      zoomCtrl.onZoomChange(ZOOM_LEVEL_MAX + 1);
      expect(ctrl.zoom.setZoomLevel).toHaveBeenCalledWith(ZOOM_LEVEL_MAX);
    });
    it("should cap zoom at MIN", () => {
      // @ts-ignore
      zoomCtrl.onZoomChange(ZOOM_LEVEL_MIN - 1);
      expect(ctrl.zoom.setZoomLevel).toHaveBeenCalledWith(ZOOM_LEVEL_MIN);
    });
  });
});

describe("makeOnZoomAndPanListenerNoDebounce", () => {
  let mockCtrl: ReturnType<typeof makeMockController>;
  let ctrl: Controller;
  beforeEach(() => {
    mockCtrl = makeMockController();
    // @ts-ignore
    ctrl = mockCtrl;
  });
  it("should call zoom function", () => {
    mockCtrl.forceGraphRef.current.zoom = jest.fn().mockReturnValue(1);
    mockCtrl.keys.shiftHeld = true;
    const zoomLevel = ctrl.zoom.zoomLevel;
    const zoom = makeOnZoomAndPanListenerNoDebounce(ctrl);
    zoom({ k: 2, x: 0, y: 0 });
    expect(ctrl.zoom.setUserZoomLevel).toHaveBeenCalledTimes(1);
    expect(ctrl.zoom.setUserZoomLevel).toHaveBeenCalledWith(
      zoomLevel + ZOOM_LEVEL_STEP,
    );
  });
  it("should do nothing when shift-key is not pressed", () => {
    mockCtrl.forceGraphRef.current.zoom = jest.fn().mockReturnValue(1);
    const zoom = makeOnZoomAndPanListenerNoDebounce(ctrl);
    zoom({ k: 2, x: 0, y: 0 });
    expect(ctrl.zoom.setUserZoomLevel).not.toHaveBeenCalled();
  });
  it("should do nothing when last zoom = 0", () => {
    mockCtrl.forceGraphRef.current.zoom = jest.fn().mockReturnValue(0);
    mockCtrl.keys.shiftHeld = true;
    const zoom = makeOnZoomAndPanListenerNoDebounce(ctrl);
    zoom({ k: 2, x: 0, y: 0 });
    expect(ctrl.zoom.setUserZoomLevel).not.toHaveBeenCalled();
  });
  it("should do nothing when diff percentage < MIN_ZOOM_PERCENTAGE_DIFFERENCE", () => {
    mockCtrl.forceGraphRef.current.zoom = jest
      .fn()
      .mockReturnValue(100 * (1 + MIN_ZOOM_PERCENTAGE_DIFFERENCE * 0.5));
    mockCtrl.keys.shiftHeld = true;
    const zoom = makeOnZoomAndPanListenerNoDebounce(ctrl);
    zoom({ k: 100, x: 0, y: 0 });
    expect(ctrl.zoom.setUserZoomLevel).not.toHaveBeenCalled();
  });
});