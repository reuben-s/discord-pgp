export function getCurrentDMUsername()
{
    const usernameTitle = document.querySelector('.titleWrapper__482dc > h1 > [aria-label]');
    return usernameTitle.getAttribute('aria-label');
}

export function checkIfGroupDM()
{
    const groupDM = document.querySelector('.hiddenVisually__06c3e');
    return groupDM.innerHTML == "Group DM";
}

export function checkIfBot()
{
    const botTag = document.querySelector('[aria-label="Verified Bot"]');
    const systemTag = document.querySelector('.defaultColor__77578 > div[aria-label="discord"]');
    return (botTag != null) || (systemTag != null);
}