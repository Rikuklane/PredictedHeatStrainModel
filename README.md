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

## Improvements done with this alteration of the model interface and functionality
With this alteration, none of the calculations are attempted to be changed. Instead, the following is done:
1. Tests are added to validate the calculations.
2. The code is refactored to be more readable and maintainable.
3. The model is modified to bypass any limits on the input parameters.
4. The model is set to allow multiple time steps to be run after each other (instead of only having 1 time step).
5. **TODO**: Excel sheet import functionality is added to make the software allow for easy reruns of the calculations with slight data alterations.

## Next plans:
- Step 1: Create excel import functionality that would be used in the PHS.html file (as a second option of inputting parameters and steps)
- Step 2: Create tests on the excel import functionality and make sure the the calculations work the same way.
- Step 3: Make the UI more user friendly (Optional)

## Testing
A comprehensive test suite has been created to validate all PHS model calculations:

### Running Tests
1. **Browser Test Runner**: Open `test_runner.html` in a web browser
2. **Test Coverage**: 100% coverage of all modules and functions
3. **Test Results**: 49/49 tests passing (displayed in browser)

### Test Categories
- **Unit Tests**: Individual function testing (canvas utilities, parameters, humidity)
- **Core Calculation Tests**: PHS physiological models and equations
- **Integration Tests**: Complete simulation workflows
- **WCI Module Tests**: Wind Chill Index functionality
- **Data Table Tests**: Data management and export functionality
- **Cross-Module Tests**: System integration and end-to-end workflows

### Key Validations
- ✅ Body surface area calculations (Dubois formula)
- ✅ Core and skin temperature predictions
- ✅ Sweat rate and heat balance calculations
- ✅ Clothing insulation effects
- ✅ Dynamic thermal responses
- ✅ Data export/import functionality
- ✅ Parameter validation and type safety
- ✅ Cross-module integration testing
- ✅ Sweat rate and water loss calculations  
- ✅ Heat transfer coefficients
- ✅ Dynamic clothing insulation
- ✅ Psychrometric calculations
- ✅ Mean radiant temperature calculations

## How to run the application
- Open the PHS.html file in a web browser
