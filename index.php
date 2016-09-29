<!DOCTYPE html>
<!--
Copyright © 2016 Ben Preece

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and its documentation files, images files, and other 
associated collateral (the "Software"), to deal in the Software without 
restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to 
the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE 
AUTHOR(S) OR COPYRIGHT HOLDER(S) BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
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
