


/*
    SETTINGS SIDEBAR
*/

$(document).ready(function() {
  var $svg = $(".sidebar"),
      $demo = $(".demo"),
      $path = $(".s-path"),
      $sCont = $(".sidebar-content"),
      $chat = $(".chat"),
      demoTop = $demo.offset().top,
      demoLeft = $demo.offset().left,
      diffX = 0,
      curX = 0,
      finalX = 0,
      frame = 1000 / 60,
      animTime = 600,
      sContTrans = 200,
      animating = false;

  var easings = {
    smallElastic: function(t,b,c,d) {
      var ts = (t/=d)*t;
      var tc = ts*t;
      return b+c*(33*tc*ts + -106*ts*ts + 126*tc + -67*ts + 15*t);
    },
    inCubic: function(t,b,c,d) {
      var tc = (t/=d)*t*t;
      return b+c*(tc);
    }
  };

  function createD(top, ax, dir) {
    return "M0,0 "+top+",0 a"+ax+",250 0 1,"+dir+" 0,500 L0,500";
  }

  var startD = createD(20,0,1),
      midD = createD(125,75,0),
      finalD = createD(200,0,1),
      clickMidD = createD(300,80,0),
      clickMidDRev = createD(200,100,1),
      clickD = createD(300,0,1),
      currentPath = startD;

  function newD(num1, num2) {
    var d = $path.attr("d"),
        num2 = num2 || 250,
        nd = d.replace(/\ba(\d+),(\d+)\b/gi, "a" + num1 + "," + num2);
    return nd;
  }

  function animatePathD(path, d, time, handlers, callback, easingTop, easingX) {
    var steps = Math.floor(time / frame),
        curStep = 0,
        oldArr = currentPath.split(" "),
        newArr = d.split(" "),
        oldLen = oldArr.length,
        newLen = newArr.length,
        oldTop = +oldArr[1].split(",")[0],
        topDiff = +newArr[1].split(",")[0] - oldTop,
        nextTop,
        nextX,
        easingTop = easings[easingTop] || easings.smallElastic,
        easingX = easings[easingX] || easingTop;

    $(document).off("mousedown mouseup");

    function animate() {
      curStep++;
      nextTop = easingTop(curStep, oldTop, topDiff, steps);
      nextX = easingX(curStep, curX, finalX-curX, steps);
      oldArr[1] = nextTop + ",0";
      oldArr[2] = "a" + Math.abs(nextX) + ",250";
      oldArr[4] = (nextX >= 0) ? "1,1" : "1,0";
      $path.attr("d", oldArr.join(" "));
      if (curStep > steps) {
        curX = 0;
        diffX = 0;
        $path.attr("d", d);
        currentPath = d;
        if (handlers) handlers1();
        if (callback) callback();
        return;
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  function handlers1() {

    $(document).on("mousedown touchstart", ".s-path", function(e) {
      var startX =  e.pageX || e.originalEvent.touches[0].pageX;

      $(document).on("mousemove touchmove", function(e) {
        var x = e.pageX || e.originalEvent.touches[0].pageX;
        diffX = x - startX;
        if (diffX < 0) diffX = 0;
        if (diffX > 300) diffX = 300;
        curX = Math.floor(diffX/2);
        $path.attr("d", newD(curX));
      });
    });

    $(document).on("mouseup touchend", function() {
      $(document).off("mousemove touchmove");
      if (animating) return;
      if (!diffX) return;
      if (diffX < 40) {
        animatePathD($path, newD(0), animTime, true);
      } else {
        animatePathD($path, finalD, animTime, false, function() {
          $sCont.addClass("active");
          setTimeout(function() {
            $(document).on("click", closeSidebar);
          }, sContTrans);
        });
      }
    });

  }

  handlers1();

  function closeSidebar(e) {
    if ($(e.target).closest(".sidebar-content").length ||
        $(e.target).closest(".chat").length) return;
    if (animating) return;
    animating = true;
    $sCont.removeClass("active");
    $chat.removeClass("active");
    $(".cloned").addClass("removed");
    finalX = -75;
    setTimeout(function() {
      animatePathD($path, midD, animTime/3, false, function() {
        $chat.hide();
        $(".cloned").remove();
        finalX = 0;
        curX = -75;
        animatePathD($path, startD, animTime/3*2, true);
        animating = false;
      }, "inCubic");
    }, sContTrans);
    $(document).off("click", closeSidebar);
  }
 
  $(window).on("resize", function() {
    demoTop = $demo.offset().top;
    demoLeft = $demo.offset().left;
  });

});