/* globals wheel */
(() => {
  'use strict';

  const wheelParts = [];
  document.addEventListener(
    'wheelPartLoaded',
    async (e) => {
      // Check if the wheel part can genrate a random number
      const wheelPart = e.detail;
      try {
        const randomNumber = await wheelPart.feelingLucky();
        if (randomNumber > 0 && randomNumber <= 100) {
          wheelParts.push(wheelPart);

          wheel.setWheelParts(wheelParts);
          wheel.drawWheel();
        } else {
          console.error(
            `Wheel part ${wheelPart.name} cannot generate random numbers between [1, 100]`
          );
        }
      } catch (err) {
        console.error(
          `Wheel part ${wheelPart.name} threw an exception while random number check. ${err}`
        );
      }
    },
    false
  );

  wheel.onSpinning(() => {
    wheel.setCenterText(null);
    wheel.drawCenterCircleText();
  });

  wheel.onSpinned(async () => {
    const currentWheelPart = wheel.getCurrentWheelPart();
    wheel.setCenterText(
      await currentWheelPart.feelingLucky(),
      currentWheelPart.bgColor
    );
    wheel.drawCenterCircleText();
  });

  document.getElementById('spinBtn').addEventListener(
    'click',
    () => {
      wheel.spin(Math.random());
    },
    false
  );
})();
