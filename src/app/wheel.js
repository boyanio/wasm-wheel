import Two from 'two.js';

const COLORS = [
  '#f7d046',
  '#ff4c5a',
  '#f08cba',
  '#49c4d2',
  '#924e84',
  '#fd926f',
  '#245a65',
  '#ff6a76',
  '#633d89',
];
const PI = Math.PI;
const TAU = PI * 2;
const degToRad = (deg) => (deg / 180) * PI;

const getCoordOnCircle = (r, angleInRad, ref) => ({
  x: ref.cx + r * Math.cos(angleInRad),
  y: ref.cy + r * Math.sin(angleInRad),
});

const wheelFactory = (mountElem) => {
  if (!mountElem || !('nodeType' in mountElem)) {
    throw new Error('no mount element provided');
  }

  const ratios = {
    tickerRadius: 0.06, // of width
    textSize: 0.1, // of radius
    edgeDist: 0.14,
  };

  const friction = 0.95;
  const maxSpeed = 0.5;
  const centerCircleEl = {
    text: null,
    innerCircle: null,
  };
  const centerCircleText = {
    text: '',
    bgColor: '#fff',
  };
  let isGroupActive = false;
  let curPosArr = [];
  let dirScalar = 1;
  let lastCurTime;
  let speed;
  let wheelParts = [];
  let two;
  let group;
  let options = {
    width: 360,
    height: 360,
  };

  const init = (opts) => {
    options = Object.assign({}, options, opts);
    two = new Two({
      type: Two.Types.svg,
      width: options.width,
      height: options.height,
    })
      .bind('resize', handleResize)
      .play();

    initEvents();
    two.appendTo(mountElem);
    setViewBox(options.width, options.height);

    two.renderer.domElement.setAttribute(
      'style',
      `-moz-user-select:none;
      -ms-user-select:none;
      -webkit-user-select:none;
      user-select:none;
      -webkit-tap-highlight-color: rgba(0,0,0,0);`
    );
  };

  const setWheelParts = (wheelPartsArr) => {
    wheelParts = wheelPartsArr;
  };

  const setCenterText = (text, bgColor) => {
    centerCircleText.text = text || '';
    centerCircleText.bgColor = bgColor || '#fff';
  };

  const setViewBox = (width, height) => {
    two.renderer.domElement.setAttribute(
      'viewBox',
      '0 0 ' + width + ' ' + height
    );
  };

  const drawTicker = () => {
    const width = two.width;
    const outerRadius = ratios.tickerRadius * width;
    const tickerCircle = drawTickerCircle(outerRadius);
    const circleCenter = tickerCircle.translation;

    drawTickerArrow(outerRadius, degToRad(30), circleCenter);
  };

  const drawCenterCircleText = () => {
    if (centerCircleEl.text) {
      centerCircleEl.text.value = centerCircleText.text;
    }
    if (centerCircleEl.innerCircle) {
      centerCircleEl.innerCircle.fill = centerCircleText.bgColor;
    }
  };

  const drawCenterCircle = () => {
    const width = two.width;
    const yOffset = width * ratios.tickerRadius * 2;
    const radius = (width - yOffset) / 2;
    const center = {
      x: width / 2,
      y: radius + yOffset,
    };

    const outerCircle = two.makeCircle(center.x, center.y, radius * 0.16);
    outerCircle.noStroke();

    const innerCircle = two.makeCircle(center.x, center.y, radius * 0.15);
    innerCircle.noStroke();
    centerCircleEl.innerCircle = innerCircle;

    const textSize = radius * ratios.textSize * 0.8;
    const text = two.makeText('', center.x, center.y + textSize / 10);
    text.fill = '#fff';
    text.size = textSize;
    text.weight = 'bolder';
    centerCircleEl.text = text;

    drawCenterCircleText();
  };

  const drawTickerCircle = (outerRadius) => {
    const width = two.width;
    const arc = two.makeArcSegment(
      width / 2,
      outerRadius,
      outerRadius,
      outerRadius * 0.5,
      0,
      2 * PI
    );
    arc.noStroke();

    return arc;
  };

  const drawTickerArrow = (radius, tangentAngle, tickerCenter) => {
    const x = tickerCenter.x;
    const y = tickerCenter.y;
    const pointA = getCoordOnCircle(radius, PI / 2, { cx: x, cy: y });
    const pointB = getCoordOnCircle(radius, tangentAngle, { cx: x, cy: y });
    const pointC = {
      x: x,
      y: y + radius / Math.cos(PI / 2 - tangentAngle),
    };
    const pointD = getCoordOnCircle(radius, PI - tangentAngle, {
      cx: x,
      cy: y,
    });
    const path = two.makePath(
      pointA.x,
      pointA.y,
      pointB.x,
      pointB.y,
      pointC.x,
      pointC.y,
      pointD.x,
      pointD.y
    );
    path.noStroke();

    return path;
  };

  const drawWheel = () => {
    if (group) {
      destroyPaths();
    }

    const width = two.width;
    const numColors = COLORS.length;
    const rotationUnit = (2 * PI) / wheelParts.length;
    const yOffset = width * ratios.tickerRadius * 2;
    const radius = (width - yOffset) / 2;
    const center = {
      x: width / 2,
      y: radius + yOffset,
    };
    group = two.makeGroup();

    wheelParts.map((wheelPart, i, arr) => {
      const angle = rotationUnit * i - (PI + rotationUnit) / 2;
      const arc = two.makeArcSegment(
        center.x,
        center.y,
        0,
        radius,
        0,
        (2 * PI) / arr.length
      );
      arc.rotation = angle;
      arc.noStroke();
      arc.fill = COLORS[i % numColors];

      const textVertex = {
        x:
          center.x +
          (radius - radius * ratios.edgeDist) *
            Math.cos(angle + rotationUnit / 2),
        y:
          center.y +
          (radius - radius * ratios.edgeDist) *
            Math.sin(angle + rotationUnit / 2),
      };

      const text = two.makeText(wheelPart.name, textVertex.x, textVertex.y);
      text.rotation = rotationUnit * i - PI / 2;
      text.alignment = 'right';
      text.fill = '#fff';
      text.size = radius * ratios.textSize;

      group.add(arc, text);

      wheelPart.bgColor = arc.fill;
    });

    group.translation.set(center.x, center.y);
    group.center();
    drawTicker();
    drawCenterCircle();

    two.update();
  };

  const handleResize = () => {
    setViewBox(two.width, two.height);
    drawWheel();
    drawTicker();
    drawCenterCircle();
    two.update();
  };

  const handleCursorDown = (e) => {
    const groupElem = group._renderer.elem;
    isGroupActive = groupElem === e.target || groupElem.contains(e.target);
    curPosArr = isGroupActive ? curPosArr.concat(getEventPos(e)) : curPosArr;
    lastCurTime = performance.now();
  };

  const handleCursorMove = (e) => {
    if (isGroupActive && curPosArr.length) {
      e.preventDefault();
      lastCurTime = performance.now();
      curPosArr = curPosArr.concat(getEventPos(e));
      const currPos = curPosArr[curPosArr.length - 1];
      const prevPos = curPosArr[curPosArr.length - 2];
      const groupBounds = group._renderer.elem.getBoundingClientRect();
      const groupCenter = {
        x: groupBounds.left + groupBounds.width / 2,
        y: groupBounds.top + groupBounds.height / 2,
      };
      const angleAtCursorDown = Math.atan2(
        prevPos.y - groupCenter.y,
        prevPos.x - groupCenter.x
      );
      const angleAtCursorNow = Math.atan2(
        currPos.y - groupCenter.y,
        currPos.x - groupCenter.x
      );
      const deltaRotation = angleAtCursorNow - angleAtCursorDown;
      dirScalar = deltaRotation > 0 ? 1 : -1;
      group.rotation = (group.rotation + deltaRotation) % TAU;
      two.update();
    }
  };

  const handleCursorUp = (e) => {
    if (isGroupActive && curPosArr.length > 1) {
      const currPos = getEventPos(e);
      const lastPos = curPosArr[curPosArr.length - 2];
      const timeNow = performance.now();
      const time = timeNow - lastCurTime;
      const distance = Math.sqrt(
        Math.pow(currPos.x - lastPos.x, 2) + Math.pow(currPos.y - lastPos.y, 2)
      );
      speed = Math.min(distance / time, maxSpeed);
      two.bind('update', animateWheel);
      two.trigger('my:spinning');
    }

    curPosArr = [];
    isGroupActive = false;
  };

  const getEventPos = (e) => {
    const { clientX, clientY } = getEvent(e);
    return { x: clientX, y: clientY };
  };

  const getEvent = (e) => (e.changedTouches ? e.changedTouches[0] : e);

  const animateWheel = () => {
    group.rotation = (group.rotation + speed * dirScalar) % TAU;
    speed = speed * friction;

    if (speed < 0.005) {
      two.unbind('update', animateWheel);
      two.trigger('completed');
    }
  };

  const spin = (newSpeed) => {
    speed = newSpeed;
    two.bind('update', animateWheel);
    two.trigger('my:spinning');
  };

  const updateDims = ({ height, width }) => {
    two.width = parseInt(width, 10);
    two.height = parseInt(height, 10);
    two.trigger('resize');
  };

  const getCurrentWheelPart = () => {
    const numWords = wheelParts.length;
    const segmentAngle = TAU / numWords;
    const currAngle = (TAU - group.rotation + segmentAngle / 2) % TAU;
    return wheelParts.find((_, i) => segmentAngle * (i + 1) > currAngle);
  };

  const eventMap = {
    mousedown: handleCursorDown,
    touchstart: handleCursorDown,
    mousemove: handleCursorMove,
    touchmove: handleCursorMove,
    mouseup: handleCursorUp,
    touchend: handleCursorUp,
  };

  const initEvents = () => {
    const domElement = two.renderer.domElement;
    Object.keys(eventMap).map((type) =>
      domElement.addEventListener(type, eventMap[type])
    );
  };

  const removeEvents = () => {
    const domElement = two.renderer.domElement;
    two.unbind('update');
    Object.keys(eventMap).map((type) =>
      domElement.removeEventListener(type, eventMap[type])
    );
  };

  const destroyPaths = () => {
    group.remove.apply(group, group.children);
    two.clear();
  };

  const destroy = () => {
    destroyPaths();
    removeEvents();
    return true;
  };

  const onSpinning = (callback) => {
    two.bind('my:spinning', callback);
  };

  const onSpinned = (callback) => {
    two.bind('completed', callback);
  };

  return {
    destroy: destroy,
    drawWheel: drawWheel,
    getCurrentWheelPart: getCurrentWheelPart,
    init: init,
    setWheelParts: setWheelParts,
    setCenterText: setCenterText,
    drawCenterCircleText: drawCenterCircleText,
    spin: spin,
    updateDims: updateDims,
    onSpinning: onSpinning,
    onSpinned: onSpinned,
  };
};

const mount = document.querySelector('.js-mount');
const wheel = wheelFactory(mount);

wheel.init({
  width: Math.min(window.innerWidth, window.innerHeight),
  height: Math.min(window.innerWidth, window.innerHeight),
});

window.addEventListener('resize', () => {
  wheel.updateDims({
    width: Math.min(window.innerWidth, window.innerHeight),
    height: Math.min(window.innerWidth, window.innerHeight),
  });
});

export { wheel };
