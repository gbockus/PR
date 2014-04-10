#PR

A tool used to monitor github pull requests for an organization.  

#Getting Started

In order to install nodewebkit you will need to have installed node.  Ensure you have at least node v0.10.25. 

You must have nodewebkit installed locally to run PR.  
```javascript
npm install -g nodewebkit@0.8.4
```
Also you will need to have installed grunt-cli and bower to install the dependancies prior to starting the application.  

```
npm install -g grunt-cli bower
```

After you have pulled down the repo you must execute from the PR project directory:  
```
npm update;
bower install;
```
#Launching the application

To start the application execute the nodewebkit binary from the PR/app directory.  

```
cd PR/app;
nodewebkit
```

This projected is licensed under the terms of the MIT license.