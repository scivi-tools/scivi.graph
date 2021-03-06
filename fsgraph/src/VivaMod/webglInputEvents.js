

/**
 * Monitors graph-related mouse input in webgl graphics and notifies subscribers.
 *
 * @param {VivaGeneric.WebGlGraphics} webglGraphics
 * @returns {VivaGeneric.WebGlInputEvents}
 */
export function webglInputEvents(webglGraphics) {
  if (webglGraphics.webglInputEvents) {
    // Don't listen twice, if we are already attached to this graphics:
    return webglGraphics.webglInputEvents;
  }

  var mouseCapturedNode = null,
    mouseEnterCallback = [],
    mouseLeaveCallback = [],
    mouseDownCallback = [],
    mouseUpCallback = [],
    mouseMoveCallback = [],
    clickCallback = [],
    dblClickCallback = [],
    prevSelectStart,
    boundRect,
    documentExists = (typeof document !== undefined);

  var root = webglGraphics.getGraphicsRoot();
  startListen(root);

  var api = {
    mouseEnter: mouseEnter,
    mouseLeave: mouseLeave,
    mouseDown: mouseDown,
    mouseUp: mouseUp,
    mouseMove: mouseMove,
    click: click,
    dblClick: dblClick,
    mouseCapture: mouseCapture,
    releaseMouseCapture: releaseMouseCapture
  };

  // TODO I don't remember why this is needed:
  webglGraphics.webglInputEvents = api;

  return api;

  function releaseMouseCapture() {
    mouseCapturedNode = null;
  }

  function mouseCapture(node) {
    mouseCapturedNode = node;
  }

  function dblClick(callback) {
    if (typeof callback === 'function') {
      dblClickCallback.push(callback);
    }
    return api;
  }

  function click(callback) {
    if (typeof callback === 'function') {
      clickCallback.push(callback);
    }
    return api;
  }

  function mouseMove(callback) {
    if (typeof callback === 'function') {
      mouseMoveCallback.push(callback);
    }
    return api;
  }

  function mouseUp(callback) {
    if (typeof callback === 'function') {
      mouseUpCallback.push(callback);
    }
    return api;
  }

  function mouseDown(callback) {
    if (typeof callback === 'function') {
      mouseDownCallback.push(callback);
    }
    return api;
  }

  function mouseLeave(callback) {
    if (typeof callback === 'function') {
      mouseLeaveCallback.push(callback);
    }
    return api;
  }

  function mouseEnter(callback) {
    if (typeof callback === 'function') {
      mouseEnterCallback.push(callback);
    }
    return api;
  }

  function preciseCheck(nodeUI, x, y) {
    if (nodeUI && nodeUI.size) {
      var pos = nodeUI.position;
      var node_size = nodeUI.size;
      const eps = 1.0;

      return pos.x - node_size - eps < x && x < pos.x + node_size + eps &&
        pos.y - node_size - eps < y && y < pos.y + node_size + eps;
    }

    return true;
  }

  function getNodeAtClientPos(pos) {
    return webglGraphics.getNodeAtClientPos(pos, preciseCheck);
  }

  function stopPropagation(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }

  function handleDisabledEvent(e) {
    stopPropagation(e);
    return false;
  }

  function invoke(callbacksChain, args) {
    var i, stopPropagation;
    for (i = 0; i < callbacksChain.length; i += 1) {
      stopPropagation = callbacksChain[i].apply(undefined, args);
      if (stopPropagation) {
        return true;
      }
    }
  }

  function startListen(root) {
    var pos = {
        x: 0,
        y: 0
      },
      lastFound = null,
      lastUpdate = 1,
      lastClickTime = +new Date(),
      lastDownTime = +new Date(),
      prevDownTime = +new Date(),

      handleMouseMove = function(e) {
        invoke(mouseMoveCallback, [lastFound, e]);
        pos.x = e.clientX;
        pos.y = e.clientY;
      },

      handleMouseUp = function() {
        if (documentExists) {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
      },

      updateBoundRect = function() {
        boundRect = root.getBoundingClientRect();
      };

    window.addEventListener('resize', updateBoundRect);
    updateBoundRect();

    // mouse move inside container serves only to track mouse enter/leave events.
    root.addEventListener('mousemove',
      function(e) {
        if (mouseCapturedNode) {
          return;
        }
        if (lastUpdate++ % 7 === 0) {
          // since there is no bullet proof method to detect resize
          // event, we preemptively update the bounding rectangle
          updateBoundRect();
          lastUpdate = 1;
        }
        var cancelBubble = false,
          node;

        pos.x = e.clientX - boundRect.left;
        pos.y = e.clientY - boundRect.top;

        node = getNodeAtClientPos(pos);

        if (node && lastFound !== node) {
          lastFound = node;
          cancelBubble = cancelBubble || invoke(mouseEnterCallback, [lastFound]);
        } else if (node === null && lastFound !== node) {
          cancelBubble = cancelBubble || invoke(mouseLeaveCallback, [lastFound]);
          lastFound = null;
        }

        if (cancelBubble) {
          stopPropagation(e);
        }
      });

    root.addEventListener('mousedown',
      function(e) {
        var cancelBubble = false,
          args;
        updateBoundRect();
        pos.x = e.clientX - boundRect.left;
        pos.y = e.clientY - boundRect.top;

        prevDownTime = lastDownTime;
        lastDownTime = +new Date();
        args = [getNodeAtClientPos(pos), e];
        if (args[0]) {
          cancelBubble = invoke(mouseDownCallback, args);
          // we clicked on a node. Following drag should be handled on document events:
          if (documentExists) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }

          // @ts-ignore
          prevSelectStart = window.document.onselectstart;
          // @ts-ignore
          window.document.onselectstart = handleDisabledEvent;

          lastFound = args[0];
        } else {
          lastFound = null;
        }
        if (cancelBubble) {
          stopPropagation(e);
        }
      });

    root.addEventListener('mouseup',
      function(e) {
        var clickTime = +new Date(),
          args;

        pos.x = e.clientX - boundRect.left;
        pos.y = e.clientY - boundRect.top;

        var nodeAtClientPos = getNodeAtClientPos(pos);
        var sameNode = nodeAtClientPos === lastFound;
        args = [nodeAtClientPos || lastFound, e];
        if (args[0]) {
          // @ts-ignore
          window.document.onselectstart = prevSelectStart;

          lastClickTime = clickTime;

          if (invoke(mouseUpCallback, args)) {
            stopPropagation(e);
          }
        }
      });
      
    var timeoutHandlerId = 0,
      noclick = false;

    root.addEventListener('click', function(e) {
        var clickTime = +new Date();
        if ((clickTime - lastDownTime > 200) || (noclick)) {
          return;
        }

        noclick = true;

        var realLastFound = lastFound;
        timeoutHandlerId = setTimeout(() => {
          var args;

          updateBoundRect();

          // HACK: учитываем только ту вершину, по которой было нажатие ранее
          args = [realLastFound, e];
          invoke(clickCallback, args);

          noclick = false;
        }
        , 200);
      });

    root.addEventListener('dblclick',
      function(e) {
        var clickTime = +new Date(),
          args;
        
        if (clickTime - prevDownTime > 400) {
          return;
        }

        clearTimeout(timeoutHandlerId);
        noclick = false;
        
        updateBoundRect();
        pos.x = e.clientX - boundRect.left;
        pos.y = e.clientY - boundRect.top;

        args = [getNodeAtClientPos(pos), e];
        invoke(dblClickCallback, args);
      });
  }
}
