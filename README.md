# PredictedHeatStrainModel
This project is an alteration of the Lund University PHS model: https://www.eat.lth.se/fileadmin/eat/Termisk_miljoe/PHS/PHS.html

## Copyright
Copyright (c) 2014, Bo Johansson, Lund and Department of Design Sciences (EAT), Lund University
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of the Department of Design Sciences (EAT), Lund University nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## Modifications
**Interface and functionality enhancements (2023-2025) by Richard Kuklane**

The original PHS model calculations remain unchanged. The following improvements were made to enhance usability, functionality, and code quality:

### 🎯 User Interface & Workflow
- **Multi-timestep support** - "Start simulation" → "Add timestep" workflow
- **Timestep validation** - Prevents duplicate or past end times with user-friendly error messages
- **Tab navigation interface** - Clean tabbed UI for Parameters, Graph, Table, and About sections
- **UI button state management** - Proper enable/disable logic for workflow control
- **Modernized UI** - Updated interface with a more modern feel and improved user experience.

### 📊 Data Management & Export
- **Excel export functionality** - Professional multi-sheet Excel files with proper formatting
- **Selective parameter limits** - Removed artificial constraints for most scenarios, with scientific limits retained where appropriate

### 🔧 Code Quality & Testing
- **Code refactoring** - Improved readability, maintainability, and modern API structure
- **Comprehensive testing** - Extensive test suite to validate all functionality

## How to Use
1. Open `PHS.html` in a web browser
2. Set simulation parameters (weight, height, etc.)
3. Set environmental conditions (temperature, metabolism, etc.)
4. Click "Start simulation" to begin the first timestep
5. Add additional timesteps with "Add timestep" (validation prevents duplicate/past times)
6. Export results using the "Export to Excel" dropdown button (appears after first simulation)

## Excel Export Features
- **Input** - Combined simulation + step parameters in one sheet
- **Output** - Time series physiological data for graphing
- Automatic file downloads with clear naming

## Testing
Open `test_runner.html` in a browser to run comprehensive tests covering:

- **Core PHS calculations** - Body surface area, temperature predictions, sweat rates, heat balance
- **Multi-timestep workflows** - Step progression, parameter changes, time advancement
- **Timestep validation** - Duplicate prevention, past time rejection, error handling
- **Tab navigation** - UI interaction, content switching, "All" tab functionality
- **Excel export functionality** - File generation, data organization, column formatting
- **UI button states** - Start/Add timestep workflow, parameter locking, enable/disable logic
- **Data validation** - Parameter consistency, type safety, cross-module integration
- **Physiological models** - Clothing insulation, heat transfer, psychrometric calculations

## Dependencies
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - fully client-side
- Optional: Excel software for viewing exported files

## Future Plans
- **Excel Import Functionality** - Ability to load simulation parameters from Excel files for batch processing and reproducible research
- **Advanced Validation** - Scientific parameter ranges with tooltips and guidance
