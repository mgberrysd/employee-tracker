# employee-tracker

## Description

This project aimed to create a command line application that could generate an SVG image after prompting the user with questions. When the application is run from the command line via the command node index.js, the user is prompted to answer questions about what they would like their SVG file to look like including text that should be displayed in the SVG, text color, shape, and shape fill color. Once the questions have been answered an SVG logo is generated from thier responses.

This project once again highlighted the use of node.js to write start writing backend code using JS as the entire application is run via the command line. This project also used a test driven work flow as the tests were provided and the code to generate the svg files had to be written in a way to satisfy the tests. The inquirer package was once again used to create the question prompts and make the object where the answers were stored. The Jest package was used for unit testing to ensure that the SVG files were generated correctly.

## Usage

As this project was not deployed, the repo of the project can be found at https://github.com/mgberrysd/svg-logo-maker

When run on the command line the user should see the following:

![SVG logo maker question prompt when run from the command line](assets/svg_cli_ex.png)

A video of the application being run can be found at https://drive.google.com/file/d/1V97tGK8tdl74R4QeIP6T2Jzy-kSN0JRo/

An example generated SVG is shown below:

![Example SVG logo](examples/logo.svg)

## Credits

The JS for the SVG Logo Maker was created by Michael Berry.

The project used the node Inquirer package for the command line prompts and the node Jest package for unit testing.