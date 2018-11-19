
class Belt:

    def getCharFor(self, beltSpeed, beltMode):
        char = '5'
        if beltSpeed == 1:
            if beltMode == 1:
                char = '4'
            elif beltMode == 2:
                char = '5'
            elif beltMode == 3:
                char = '6'
        elif beltSpeed == 2:
            if beltMode == 1:
                char = '3'
            elif beltMode == 2:
                char = '5'
            elif beltMode == 3:
                char = '7'

        return char
