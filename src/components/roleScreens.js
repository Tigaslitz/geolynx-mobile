const roleScreens = {
    SYSADMIN: [
        'Home', 'ListUsers', 'Profile', 'AccountManagement', 'AccountRemovalRequests',
        'ChangeAttributes', 'ChangePassword', 'ChangeRole', 'Map', 'RequestAccountRemoval',
        'WorksheetCreate', 'WorksheetUpdate', 'WorkSheetList', 'WorkSheet', 'Operations',
        'ExecutionSheets', 'ExecutionSheetDetail', 'ExecutionOperation', 'PolygonOperation',
        'SettingsScreen', 'UserManualScreen'
    ],
    SYSBO: [
        'Home', 'ListUsers', 'Profile', 'AccountManagement', 'AccountRemovalRequests',
        'ChangeAttributes', 'ChangePassword', 'ChangeRole', 'Map', 'RequestAccountRemoval',
        'WorkSheetList', 'WorkSheet', 'SettingsScreen', 'UserManualScreen'
    ],
    RU: [
        'Home', 'Profile', 'ChangeAttributes', 'ChangePassword', 'RequestAccountRemoval',
        'SettingsScreen', 'UserManualScreen'
    ],
    SMBO: [
        'Home', 'Profile', 'ChangeAttributes', 'ChangePassword', 'RequestAccountRemoval',
        'WorksheetCreate', 'WorksheetUpdate', 'WorkSheetList', 'WorkSheet', 'SettingsScreen', 'UserManualScreen'
    ],
    SGVBO: [
        'Home', 'Profile', 'ChangeAttributes', 'ChangePassword', 'RequestAccountRemoval',
        'WorkSheetList', 'WorkSheet', 'SettingsScreen', 'UserManualScreen'
    ],
    SDVBO: [
        'Home', 'Profile', 'ChangeAttributes', 'ChangePassword', 'RequestAccountRemoval',
        'WorkSheetList', 'WorkSheet', 'ExecutionSheets', 'ExecutionSheetDetail', 'SettingsScreen', 'UserManualScreen'
    ],
    PRBO: [
        'Home', 'Profile', 'ChangeAttributes', 'ChangePassword', 'RequestAccountRemoval',
        'Operations', 'ExecutionSheets', 'ExecutionSheetDetail', 'SettingsScreen', 'UserManualScreen'
    ],
    PO: [
        'Home', 'Profile', 'AccountManagement', 'RequestAccountRemoval', 'Operations',
        'ExecutionSheets', 'ExecutionSheetDetail', 'ExecutionOperation', 'PolygonOperation',
        'SettingsScreen', 'UserManualScreen'
    ],
    ADLU: [
        'Home', 'Profile', 'ChangeAttributes', 'ChangePassword', 'RequestAccountRemoval',
        'SettingsScreen', 'UserManualScreen'
    ],
    VU: [
        'Home', 'Profile', 'SettingsScreen', 'UserManualScreen'
    ],
    SYSTEM: [
        // Se necessário, adicione screens específicas do sistema
    ]
};

export default roleScreens;