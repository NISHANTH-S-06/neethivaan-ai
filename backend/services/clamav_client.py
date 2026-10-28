import socket

def scan_file_stream(file_stream, host='localhost', port=3310):
    # Simplified clamd network scan stream protocol (zINSTREAM)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((host, port))
        s.send(b'zINSTREAM\0')
        
        while chunk := file_stream.read(2048):
            length = len(chunk)
            s.send(length.to_bytes(4, byteorder='big'))
            s.send(chunk)
            
        s.send(b'\0\0\0\0')
        result = s.recv(1024).decode('utf-8')
        s.close()
        
        if 'OK' in result:
             return True
        return False
    except Exception as e:
        print(f"ClamAV scan connection failed: {e}")
        # Default to fail-safe if scanner breaks
        return False
