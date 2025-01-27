var boxSpeed=0;
var reverse=true;
var navRecords={}
var colour="#f6d404";
var tracing=false, svgPath="", mX=0, mY=0, traceCount=0, boxIsAnimating=0, suppressHandleScroll=0;
var oLookup=[];
var curID=0, oldID=0;
var firstID=false, lastID=false; // first and last in this box
var numIDs=0;
// Detect touch-screen devices
var inTouch=('ontouchstart' in document.documentElement);

// FUNCTIONS
// Touch ! TBC !
/*
var doTouchStart=function(e) {
  var touchX=e.touches[0].pageX-this.offsetLeft;
  var touchY=e.touches[0].pageY-this.offsetTop; 
  if (touchX<=140 && touchY<=36) document.location.href="index.html";
  startID=getIDfromX(touchX);
  showTab(startID);
  if (touchX) { }
}
var doTouchMove=function(e) {
  e.preventDefault();
  var touchX=e.touches[0].pageX-this.offsetLeft;
  var id=getIDfromX(e.touches[0].pageX);
  if (id && id!=startID && id!=oldID) showTab(id);
}
var doTouchEnd=function(e) { popupAlbumInfo(); } // Note: x is not available to endtouch
*/
var handleBoxNavMouseMove=function(e) {
  var animationStyle='direct';
  const boxNav7 = document.getElementById("boxNav7");
  const rect = boxNav7.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left)); // Snap to nearest 10 pixels
  const y = Math.floor((e.clientY - rect.top)); 
  const outputField = document.getElementById("outputmYCoordinates");


  //mX=e.pageX-this.offsetLeft;
  //mY=e.pageY-this.offsetTop;
  mX= x - this.offsetLeft;
  mY= y - this.offsetTop;
  console.log("mY reads as: " + mY + "while record property equals:" + records[curID].v);
//  if (p("allowTrace")) $('#debug').html(mX +', '+ mY);
  if (boxIsAnimating) return false; // If already animating, do nothing more, the box will head for the new mY value
  if (animationStyle=='direct') {
    // Find the closest record to the mouse position
    //console.log(curID);
    var goingDown=(mY>(records[curID].v+120))?true:false; // http://www.youtube.com/watch?v=h3Yrhv33Zb8
    var goingUp=(mY<records[curID].v)?true:false;
    //console.log("are we going up:" + goingUp);
    //console.log("are we going down:" + goingDown);
    // console.log("Mouse is at "+mY+" and current record span is "+records[curID].v+" to "+(records[curID].v+200)+" so we are "+((goingUp)?"going up":((goingDown)?"going down":"staying still")));
    if (!goingUp && !goingDown) return false; // We are still within range for the current record
    var newID=false; var firstID=false;
    for (var id in navRecords) {
      //console.log(id);
      if (!firstID) firstID=id;
      if (goingUp && records[id].v<mY && !newID){ 
        newID=id; // When going up, the FIRST record in range gets picked
        //console.log("Successful first goingUp if statement and value of newID is:" + newID);
        }
      if (goingDown && records[id].v+120>mY){
        newID=id; // When going down, the LAST matching record in range gets picked
        //console.log("Successful first goingDown if statement and value of newID is:" + newID);
      } 
    }
    if (newID) {
      curID=newID;
      //console.log("second if statment ran success");
    } else if (goingUp) {
      // Choose the top record
      curID=id;
    } else if (goingDown) {
      // Choose the first record
      curID=firstID;
    }
    moveTo(true);
  } else {
    boxIsAnimating=1;
    animateBoxNav();
  }
}

var animateBoxNav=function() {
  var v1=records[curID].v;
  var v2=v1+200;
  // Are we heading up, down or nowhere?
  if (mY<v1) {
    goNext(true);
  } else if (mY>v2) {
    goPrev(true);
  } else {
    boxIsAnimating=false; // stop animating now
  }
  // Throttle the animation
  if (boxIsAnimating) window.setTimeout(animateBoxNav,boxSpeed);
}

function goPrev() {
  var cutPoint=curID.indexOf('_7_')+3;
  var i=curID.substr(cutPoint); // BOWIE_7_5 => 5
  // console.log("curID="+curID+" whereas i="+i);
  oldID=curID;
  if (--i<1) { i=1; boxIsAnimating=false; console.log("Stopped animating at bottom ["+curID+"]!"); }
  curID=curID.substr(0,cutPoint)+i;
  moveTo(true);
}

function goNext() {
  var cutPoint=curID.indexOf('_7_')+3;
  var i=curID.substr(cutPoint); // BOWIE_7_5 => 5
  // console.log("curID="+curID+" whereas i="+i);
  oldID=curID;
  if (++i>=numIDs) { i=numIDs; boxIsAnimating=false; console.log("Stopped animating at top ["+curID+"]!"); }
  curID=curID.substr(0,cutPoint)+i; // Grab the next 7...
  moveTo(true);
}

// In reverse box, firstID = e.g. 57
function resetFirst(doScroll) {
  curID=firstID;
  $("#"+curID+"nav").show();
}

// In reverse box, lastID = 1
function resetLast(doScroll) {
  curID=lastID;
  $("#"+curID+"nav").show();
}

// Move directly to an ID
function moveTo(doScroll) {
  // Left nav
  //console.log("we've succesfully made it to the moveTo function, with curID at:" + curID);
  $("#"+curID+"nav").show(); // Switch new nav in first
  if (oldID && oldID!=curID){
     $("#"+oldID+"nav").hide();
     //console.log("we hid and moved away from id:" + oldID);
  }
  oldID=curID;
  if (curID==firstID) return resetFirst(doScroll);
  if (curID==lastID) return resetLast(doScroll);
  // history.pushState({jpID:curID}, curID+" : John Peel Singles Archive", "recordbox.html?jpID="+curID);
  $('#navFrame').css({'top':records[curID].v+'px'});
  // Main content
  //if (doScroll) $("#boxInfo7").scrollTo("#"+curID,boxSpeed,{easing:"easeInOutCubic"});
}

var handleScroll=function(e) {
  if (boxIsAnimating || suppressHandleScroll) {
    // console.log('avoiding scroll - still animating. mY='+mY+' and curID '+curID+' is between '+records[curID].v+' and '+(records[curID].v+200));
    return false;
  }
  var topID=false;
  curID=topID;
  if (topID) moveTo(false);
}

// ON-LOAD
$(document).ready(function(){
  console.log("Initialize has begun");
  // Load the data for this part of the collection
  datafile="/data/bowie-test.js";
  // Once the specific data js file has loaded, kick off initialise()
  $.getScript(datafile).done(function(){ initialise(); }).fail(function() { unavailable(); });
});

function initialise() {
  navRecords=records;
  curID = "BOWIE_7_57";
  // Capture mouse movement x & y pos on the singles nav
  $("#boxNav7").mousemove(handleBoxNavMouseMove);
  $("#boxNav7").mouseover(function() {suppressHandleScroll=1; });
  $("#boxNav7").mouseout(function() {suppressHandleScroll=0; });

  firstID=lastID=numIDs=0;
  var n="";

  for (var id in records) { 
    numIDs++;
    var r=records[id];
    // Stack the nav
    n+="<img id='"+id+"nav' src='/images/bowie-img/"+id+".png' class='nav7Img' />";
    }
  $("#boxNav7").append(n);

}

// Fired if the requested data was not available (means that this letter is currently out-of-bounds (we haven't actually photographed it yet most likely!) so loads the empty box background)
function unavailable() {
  var msg="";
  msg="'"+letter+"' is not currently available";
  msg+="<br /><span class='small'>This box is no longer available<br /><a href='index.html?letter="+letter+"'>&larr; back</a></span>";
  // Set the background image
  $("#bigMessage").html(msg);
  $("#bigMessage").fadeIn(2000);
  $('#topLogo').stop(true,false).stop(true,false).animate({'top':0},1000);
}