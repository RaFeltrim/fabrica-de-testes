*** Settings ***
Library           SeleniumLibrary
Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${URL}            https://www.saucedemo.com/
${BROWSER}        Chrome
${VALID_USER}     standard_user
${VALID_PASS}     secret_sauce
${LOCKED_USER}    locked_out_user
${INVALID_USER}   invalid_user
${INVALID_PASS}   wrong_password

*** Test Cases ***
Valid Login Test
    [Documentation]    Test login with valid credentials
    [Tags]    smoke    login
    Input Username    ${VALID_USER}
    Input Password    ${VALID_PASS}
    Click Login Button
    Verify Successful Login
    [Teardown]    Go To    ${URL}

Invalid Password Test
    [Documentation]    Test login with invalid password
    [Tags]    negative    login
    Input Username    ${VALID_USER}
    Input Password    ${INVALID_PASS}
    Click Login Button
    Verify Login Error    Epic sadface: Username and password do not match any user in this service
    [Teardown]    Go To    ${URL}

Locked User Test
    [Documentation]    Test login with locked out user
    [Tags]    negative    login
    Input Username    ${LOCKED_USER}
    Input Password    ${VALID_PASS}
    Click Login Button
    Verify Login Error    Epic sadface: Sorry, this user has been locked out.
    [Teardown]    Go To    ${URL}

Empty Credentials Test
    [Documentation]    Test login without entering any credentials
    [Tags]    negative    login
    Click Login Button
    Verify Login Error    Epic sadface: Username is required
    [Teardown]    Go To    ${URL}

Empty Password Test
    [Documentation]    Test login with username but no password
    [Tags]    negative    login
    Input Username    ${VALID_USER}
    Click Login Button
    Verify Login Error    Epic sadface: Password is required
    [Teardown]    Go To    ${URL}

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5

Input Username
    [Arguments]    ${username}
    Input Text    id:user-name    ${username}

Input Password
    [Arguments]    ${password}
    Input Text    id:password    ${password}

Click Login Button
    Click Button    id:login-button

Verify Successful Login
    Wait Until Page Contains Element    class:inventory_list    timeout=5s
    Page Should Contain Element    class:inventory_list

Verify Login Error
    [Arguments]    ${error_message}
    Wait Until Page Contains Element    css:[data-test="error"]    timeout=5s
    Element Should Contain    css:[data-test="error"]    ${error_message}
