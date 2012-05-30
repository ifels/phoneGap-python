#!/usr/bin/env python
# -*- coding: utf8 -*- 

from PySide.QtWebKit import QWebView
from PWebPage import PWebPage

class PWebVew(QWebView):
    def __init__(self, logger=None, parent=None):
        super(PWebVew, self).__init__(parent)
        self.setPage(PWebPage())

