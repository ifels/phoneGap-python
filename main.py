import os
import sys

from PySide.QtGui import QWidget, QVBoxLayout,QApplication

from PWebView import PWebVew

class Window(QWidget):
    def __init__(self):
        super(Window, self).__init__()
        self.view = PWebVew(self)
        layout = QVBoxLayout(self)
        #layout.setMargin(0)
        layout.addWidget(self.view)

def main():
    app = QApplication(sys.argv)
    window = Window()
    window.show()
    #html = open(sys.argv[1]).read()
    #window.view.setHtml(html)
    window.view.load("html"+os.path.sep+"index.html")
    app.exec_()

if __name__ == "__main__":
    main()
