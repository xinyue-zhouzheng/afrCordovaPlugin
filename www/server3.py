#coding=utf-8

import tornado.httpserver
import tornado.ioloop
import tornado.web
from tornado.options import define, options


define("port", default=8800, help="Please input your port", type=int)


class MyHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        print "setting headers!!!"
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", 
                        "x-app-key, x-sdk-version, x-request-date, x-session-key, x-task-config, x-udid, x-tid, Content-Type")
        
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        
    def get(self):
        self.write("server is running...")
        self.finish()
        
    def post(self):
        print self.request.headers
        data = self.request.body
        with open("test.jpg", "wb") as fw:
            fw.write(data)
        self.write("post method")
        self.finish()
        
    def options(self):
        # no body
        self.set_status(204)
        self.finish()
        

if __name__ == "__main__":
    tornado.options.parse_command_line()
    app = tornado.web.Application([(r"/", MyHandler)])
    
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.bind(options.port)
    http_server.start()
    
    tornado.ioloop.IOLoop.instance().start()