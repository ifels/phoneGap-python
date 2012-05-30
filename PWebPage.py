#!/usr/bin/env python
# -*- coding: utf8 -*-   

import logging

from PySide.QtWebKit import QWebPage

class PWebPage(QWebPage):
    """
    Makes it possible to use a Python logger to print javascript console messages
    """
    def __init__(self, logger=None, parent=None):
        super(PWebPage, self).__init__(parent)
        if not logger:
            logger = logging
        self.logger = logger

    def javaScriptConsoleMessage(self, msg, lineNumber, sourceID):
        self.logger.warning("JsConsole(%s:%d): %s" % (sourceID, lineNumber, msg))
        
    def javaScriptPrompt(self,originatingFrame, msg, defaultValue):
        self.logger.warning("javaScriptPrompt %s" %msg)