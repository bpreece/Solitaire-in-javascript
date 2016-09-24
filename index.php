<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
        <link type="text/css" rel="stylesheet" href="css/solitaire.css">
        <script src="js/solitaire.js"></script>
    </head>
    <body onload="SOLITAIRE.initialize();">
        <div id="content">
            <div id="banner">
                <div id="controls"><button id="redeal-button" onclick="SOLITAIRE.redeal()">Redeal</button></div>
                <div id="status">$0</div>
                <h1>SOLITAIRE</h1>
            </div>
            <div id="table">
                <div id="stock-click-target" class="stock target"></div>
                <div id="waste-click-target" class="waste col-1 target"></div>
                <div id="foundation-drop-target-1" class="foundation col-1 target" col="1"></div>
                <div id="foundation-drop-target-2" class="foundation col-2 target" col="2"></div>
                <div id="foundation-drop-target-3" class="foundation col-3 target" col="3"></div>
                <div id="foundation-drop-target-4" class="foundation col-4 target" col="4"></div>
                <div id="tableau-drop-target-1" class="tableau col-1 target" col="1"></div>
                <div id="tableau-drop-target-2" class="tableau col-2 target" col="2"></div>
                <div id="tableau-drop-target-3" class="tableau col-3 target" col="3"></div>
                <div id="tableau-drop-target-4" class="tableau col-4 target" col="4"></div>
                <div id="tableau-drop-target-5" class="tableau col-5 target" col="5"></div>
                <div id="tableau-drop-target-6" class="tableau col-6 target" col="6"></div>
                <div id="tableau-drop-target-7" class="tableau col-7 target" col="7"></div>
            </div>
        </div>
    </body>
</html>
