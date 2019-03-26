import time
import datetime
import serial
import logging
import math

class Murata:

    # Constructor
    def __init__(self, port='/dev/ttyUSB0'):
        self.ser = serial.Serial(
            port=port,
            baudrate=115200,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            bytesize=serial.EIGHTBITS,
            timeout=3
        )

    def tx(self, cmd='\r\n'):
        print('{0}: TX: {1}'.format(datetime.datetime.now(), cmd))
        self.ser.write(cmd)

    def readline(self):
        response = self.ser.readline()
        print('{0}: RX: {1}'.format(datetime.datetime.now(), response))
        return response

    def initialize(self):

        #Initializing the receiver
        print('Initializing the receiver')

        self.tx('XKSLEEP\r\n')
        response = self.readline()

        #This command is needed only if we want to change the default settings. This vakue is different for different USB dongles.
        self.tx('XKNSETINFO 35 1011 818D\r\n')
        response = self.readline()

        self.tx('XKSETKEY 00000000000000000000000000000000\r\n')
        response = self.readline()

        self.tx('XKSREG S0E 1\r\n')
        response = self.readline()

        self.tx('XKSREG S2A 0\r\n')
        response = self.readline()

        self.tx('XK-RX 1\r\n')
        response = self.readline()

        # self.tx('XKNGW 7FFF\r\n')
        self.resume()
        response = self.readline()

    # Function for translating raw packet to readable data format.
    def convertPacket(self, data):

        #Function for getting the multiplier scale.
        def datascale(val):
            scale = val[4:6]
            if scale == "00":
                return 1
            if scale == "01":
                return 10
            if scale == "02":
                return 100
            if scale == "03":
                return 100
            if scale == "04":
                return 0.1
            if scale == "05":
                return 0.01
            if scale == "06":
                return 0.001

        ss = 50
        # ts = time.strftime("%x %X", time.localtime())
        ts = math.floor(time.time() * 1000)

        print('convertPacket: {0}: {1}:'.format(ts, len(data)))

        freqs = [None]*5
        accs = [None]*5

        # datarow = [None]*16
        # datarow[0] = ts

        for i in range(5):
            freq = data[ss+(8*2*i):ss+(8*2*i)+8]
            acc = data[ss+(8*2*i)+8:ss+(8*2*i)+16]
            scalef = datascale(freq)
            scalea = datascale(acc)
            tempf = freq[0:0+4]
            tempa = acc[0:0+4]
            freq = int(tempf, 16)
            freq = freq*scalef
            acc = int(tempa, 16)
            acc = acc*scalea

            # print('             Freq:         {0}: {1}'.format(i+1, freq))
            # print('             Acc:          {0}: {1}'.format(i+1, acc))
            # datarow[(2*i)+1] = freq
            # datarow[(2*i)+2] = acc

            freqs[i] = freq
            accs[i] = acc

        # print('             Freq:         {0} {1} {2} {3} {4}'.format(datarow[1], datarow[3], datarow[5], datarow[7], datarow[9]))
        # print('             Acc:          {0} {1} {2} {3} {4}'.format(datarow[2], datarow[4], datarow[6], datarow[8], datarow[10]))
        print('             Freq:         {0} {1} {2} {3} {4}'.format(freqs[0], freqs[1], freqs[2], freqs[3], freqs[4]))
        print('             Acc:          {0} {1} {2} {3} {4}'.format(accs[0], accs[1], accs[2], accs[3], accs[4]))

        rmsval = data[ss+80:ss+80+8]
        scalerms = datascale(rmsval)
        temprms = rmsval[0:0+4]
        rmsval = int(temprms, 16)
        rmsval = rmsval*scalerms
        # datarow[11] = rmsval
        print('             RMS Acc:      {0}'.format(rmsval))

        kurtosis = data[ss+80+8:ss+80+16]
        scalek = datascale(kurtosis)
        tempkurtosis = kurtosis[0:0+4]
        kurtosis = int(tempkurtosis, 16)
        kurtosis = kurtosis*scalek
        # datarow[12] = kurtosis
        print('             Kurtosis:     {0}'.format(kurtosis))

        stemp = data[ss+80+16:ss+80+24]
        scales = datascale(stemp)
        tempstemp = stemp[0:0+4]
        stemp = int(tempstemp, 16)
        stemp = stemp*scales
        # datarow[13] = stemp
        print('             Surface temp: {0}'.format(stemp))

        rssi = data[28:28+2]
        rssival = int(rssi, 16)
        rssival = rssival - 107
        # datarow[14] = rssival
        print('             RSSI:         {0}'.format(rssival))

        nodeid = data[8:8+4]
        # datarow[15] = nodeid
        print('             Node ID:      {0}'.format(nodeid))

        # return datarow
        return ts, freqs, accs, rmsval, kurtosis, stemp, rssival, nodeid

    def resume(self):
        self.tx('XKNGW 7FFF\r\n')

    #Function to scan for the sensor node and to start the joining process.
    def scan(self):

        #Function to send XKNINFO command. This is needed in the joining mode.
        def nodejoin_info(dev_id, ntwk_id):
            net_info = 'XKNINFO ' + dev_id + ' ' + ntwk_id + ' ' + dev_id + '\r\n'
            # print datetime.datetime.now()
            # print net_info
            # ser.write(str(net_info))

            self.tx(str(net_info))

            t_end = time.time()+10
            t_retry = time.time()

            while 42:
                if self.ser.inWaiting() > 0:
                    response = self.readline()

                    if response[0:6] == "ENCONF":
                        print('      Node Join INFO: Success for {0} on {1}'.format(dev_id, ntwk_id))
                        return 1
                elif (time.time() > t_end):
                    print('      Node Join INFO: Failed to join for {0} on {1}'.format(dev_id, ntwk_id))
                    return 0
                elif (time.time() > (t_retry + 2)):
                    self.tx(str(net_info))
                    t_retry = time.time()

        #Function to send XKNOK command. This is needed in the joining mode.
        def nodejoin_nok(dev_id, ntwk_id):
            net_nok = 'XKNOK ' + dev_id + ' ' + ntwk_id + '\r\n'
            self.tx(str(net_nok))

            t_end = time.time()+10
            t_retry = time.time()

            while 42:
                if self.ser.inWaiting() > 0:
                    response = self.readline()

                    if response[0:4] == "ENOK":
                        print('      Node Join NOK: Success for {0} on {1}'.format(dev_id, ntwk_id))
                        return 1
                elif (time.time() > t_end):
                    print('      Node Join NOK: Failed for {0} on {1}'.format(dev_id, ntwk_id))
                    return 0
                elif (time.time() > (t_retry + 2)):
                    self.tx(str(net_nok))
                    t_retry = time.time()

        self.tx('XKNLISTEN 7FFF\r\n')
        response = self.readline()

        self.tx('XKNNOTIFY FFFFFFFFFFFF 3\r\n')
        print("Scan: start...")

        t_end = time.time()+60

        while 42:

            if time.time() > t_end:
                print('Scan: No sensor node found. Exiting.')
                return 0

            elif self.ser.inWaiting() > 0:
                response = self.readline()

                if response[0:5] == "ENREQ":

                    # f = open("scan_result.csv", "w")
                    dev_id = response[6:10]
                    ntwk_id = response[19:31]

                    # print('     Device ID:  {}'.format(dev_id))
                    # print('     Network ID: {}'.format(ntwk_id))

                    # f.write(dev_id + "," + ntwk_id)
                    # f.close()

                    result = nodejoin_info(dev_id, ntwk_id)
                    if (result != 1):
                        return 0

                    result = nodejoin_nok(dev_id, ntwk_id)
                    if (result != 1):
                        return 0

                    break

        print('Scan: Stop. Exiting.')

        return 1

    #Function to start config mode. This is executed after the sensor node has joined the network.
    def config(self):

        #Function to send config. settings. This is needed for configuration mode.
        def send_setting_dc00(dev_id):

            # f = open("scan_result.csv", "r")
            # dev_id = f.read()
            # f.close()
            # dev_id = dev_id[0:4]

            print('XKSEND_setting_DC00 start for {}'.format(dev_id))

            send_check = 'XKSEND 1 D800 ' + dev_id + ' 08 01FE00FF\r\n'
            self.tx(str(send_check))

            t_end = time.time()+30
            t_retry = time.time()

            while 42:
                if self.ser.inWaiting() > 0:
                    response = self.readline()
                    if (len(response) > 60):
                        break
                elif (time.time() > t_end):
                    print('Failed to check node FW_D800\r\n')
                    return 0
                elif (time.time() > (t_retry + 2)):
                    self.tx(str(send_check))
                    t_retry = time.time()

            # f = open("config_select.txt", "r")
            # config = f.read()
            # f.close()
            # if config == "1":
            #     interval = 'FF0404040400'  # 1 min
            # elif config == "60":
            #     interval = 'FF0909090900'  # 1 hour
            # elif config == "120":
            #     interval = 'FF0A0A0A0A00'  # 2 hours
            # elif config == "360":
            #     interval = 'FF0B0B0B0B00'  # 6 hours
            # elif config == "720":
            #     interval = 'FF0C0C0C0C00'  # 12 hours

            interval = 'FF0404040400'  # 1 min

            print('interval : ', interval)

            send_dc00 = 'XKSEND 0 DC00 ' + dev_id + ' 40 000109' + interval + '0102670001000000000000000001FFFFFC00010001FFFF\r\n'
            self.tx(str(send_dc00))

            t_end = time.time()+30
            t_retry = time.time()

            while 42:
                if self.ser.inWaiting() > 0:
                    response = self.readline()

                    if (response[34:40] == "020109"):
                        print('XKSEND_setting_DC00 complete')
                        return 1

                elif (time.time() > t_end):
                    print('Failed to join at XKSEND_settings_DC00')
                    return 0
                elif (time.time() > (t_retry + 2)):
                    self.tx(str(send_dc00))
                    t_retry = time.time()

        #Function to send config. setting complete command. This is needed to finish the configuration mode.
        def send_setting_de00(dev_id):

            print('XKSEND_setting_DE00 start for {}'.format(dev_id))

            t_end = time.time()+30
            t_retry = time.time()

            send_de00 = 'XKSEND 1 DE00 '+dev_id+' 08 00FF09FF\r\n'

            self.tx(str(send_de00))

            while 42:
                if self.ser.inWaiting() > 0:
                    response = self.readline()

                    if (response[23:27] == "DE00"):
                            #if response[0:7] == "ERXDATA":
                        print('XKSEND_setting_DE00 complete.')
                        return 1
                elif (time.time() > t_end):
                    print('Failed to join at XKSEND_setting_DE00.')
                    return 0
                elif (time.time() > (t_retry + 2)):
                    self.tx(str(send_de00))
                    t_retry = time.time()

        print('Config: Waiting for node to send node config data')

        self.resume()

        t_end = time.time()+10

        while 42:
            if self.ser.inWaiting() > 0:
                response = self.readline()

                if response[0:7] == "ERXDATA":

                    dev_id = response[8:12]
                    result = send_setting_dc00(dev_id)

                    if (result != 1):
                        return 0

                    result = send_setting_de00(dev_id)

                    if (result != 1):
                        return 0

                    break
            elif time.time() > t_end:
                print('Config: Cannot configure node settings. Exiting')
                return 0

        print('Config: Success: exit')
        return 1