public void clickAndSendKeysHackSetValue(By by, String text) {
      	Preconditions.checkArgument(!Strings.isNullOrEmpty(text));
        AugmentedIOSElement element = augmentedIOSFunctionsFactory.create(driver).findElementClickable(by);
        element.click();
        //We type the first letter so it triggers the validation.
        element.sendKeys(String.valueOf(text.charAt(0)));
        ((IOSElement) element.webElement()).setValue(text);
    }

    public void clickAndSendKeysHackTypeLastLetter(By by, String text) {
        clickAndSendKeysHackSetValue(by, text.substring(0, text.length() - 1));
        sendKeysHackRetry(text.substring(text.length() - 1, text.length()));
    }

    public void sendKeysHackRetry(String text) {
        int maxAttempt = 5;
        for(int attempt = 1; attempt <= maxAttempt; attempt++) {
            try {
                this.driver.getKeyboard().sendKeys(text);
                return;
            } catch (WebDriverException e) {
                if (attempt >= maxAttempt) {
                    throw new AssertionError(String.format("Tried %s times to do getKeyboard() but failed", maxAttempt));
                }
            }
        }
    }